'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import * as api from '@/lib/api';
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/types/transaction';
import { formatAmount, formatDate, getCategoryIcon } from '@/lib/utils';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface TransactionDisplay {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount_paisa: number;
}

function TransactionsContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get('search');
    const { isAuthenticated } = useAuth();
    const { settings } = useSettings();
    const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadTransactions();
        }
    }, [isAuthenticated, search]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const { transactions: data } = await api.getTransactions();

            let filteredData = data.map(t => ({
                id: t.id,
                date: t.date.split('T')[0],
                type: t.type as 'income' | 'expense',
                category: t.category,
                description: t.description,
                amount_paisa: t.amountPaisa,
            }));

            if (search) {
                const lowerSearch = search.toLowerCase();
                filteredData = filteredData.filter(t =>
                    t.description.toLowerCase().includes(lowerSearch) ||
                    t.category.toLowerCase().includes(lowerSearch)
                );
            }

            setTransactions(filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES;

    useEffect(() => {
        setCategory(categories[0]);
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const transactionData = {
                date: new Date(date).toISOString(),
                type: type as 'income' | 'expense',
                category,
                description,
                amountPaisa: Math.round(parseFloat(amount) * 100),
            };

            if (editingId) {
                await api.updateTransaction(editingId, transactionData);
                setEditingId(null);
            } else {
                await api.createTransaction(transactionData);
            }

            resetForm();
            await loadTransactions();
            setShowForm(false);
        } catch (error) {
            console.error('Failed to save transaction:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (transaction: TransactionDisplay) => {
        setEditingId(transaction.id);
        setDate(transaction.date);
        setType(transaction.type);
        setCategory(transaction.category);
        setDescription(transaction.description);
        setAmount((transaction.amount_paisa / 100).toString());
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this transaction?')) {
            try {
                await api.deleteTransaction(id);
                await loadTransactions();
            } catch (error) {
                console.error('Failed to delete transaction:', error);
            }
        }
    };

    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setType('expense');
        setCategory(EXPENSE_CATEGORIES[0]);
        setDescription('');
        setAmount('');
        setEditingId(null);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-slate-500">Loading transactions...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Transaction
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {editingId ? 'Edit Transaction' : 'Add New Transaction'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                                className="select-field"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="select-field"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Amount ({settings.symbol})
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="input-field"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field"
                                placeholder="Enter description"
                                required
                            />
                        </div>

                        <div className="col-span-2 flex gap-3">
                            <button type="submit" disabled={saving} className="btn-primary flex-1">
                                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'} Transaction
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                {transactions.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {transactions.map((transaction) => {
                            const Icon = getCategoryIcon(transaction.category);
                            const isIncome = transaction.type === 'income';
                            const color = isIncome ? '#10b981' : '#ef4444';
                            const bgColor = isIncome ? '#d1fae5' : '#fee2e2';

                            return (
                                <div
                                    key={transaction.id}
                                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ background: bgColor, color }}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{transaction.category}</div>
                                            <div className="text-sm text-slate-500">
                                                {formatDate(transaction.date)} • {transaction.description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-lg" style={{ color }}>
                                                {isIncome ? '+' : '-'} {formatAmount(transaction.amount_paisa, settings.symbol)}
                                            </div>
                                            <div
                                                className="category-pill inline-block"
                                                style={{ background: bgColor, color }}
                                            >
                                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(transaction)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">📝</div>
                        <p className="text-slate-500">No transactions yet. Add your first transaction!</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransactionsContent />
        </Suspense>
    );
}
