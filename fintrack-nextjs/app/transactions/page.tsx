'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '@/lib/storage';
import { Transaction, EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/types/transaction';
import { generateId, formatAmount, formatDate, getCategoryIcon } from '@/lib/utils';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function TransactionsPage() {
    const searchParams = useSearchParams();
    const search = searchParams.get('search');
    const { username } = useAuth();
    const { settings } = useSettings();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (username) {
            loadTransactions();
        }
    }, [username, search]);

    const loadTransactions = () => {
        if (!username) return;
        let data = getTransactions(username);

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter(t =>
                t.description.toLowerCase().includes(lowerSearch) ||
                t.category.toLowerCase().includes(lowerSearch)
            );
        }

        setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_SOURCES;

    useEffect(() => {
        setCategory(categories[0]);
    }, [type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        const transactionData: Transaction = {
            id: editingId || generateId(),
            date,
            type,
            category,
            description,
            amount_paisa: Math.round(parseFloat(amount) * 100),
        };

        if (editingId) {
            updateTransaction(username, editingId, transactionData);
            setEditingId(null);
        } else {
            addTransaction(username, transactionData);
        }

        resetForm();
        loadTransactions();
        setShowForm(false);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setDate(transaction.date);
        setType(transaction.type);
        setCategory(transaction.category);
        setDescription(transaction.description);
        setAmount((transaction.amount_paisa / 100).toString());
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (!username) return;
        if (confirm('Delete this transaction?')) {
            deleteTransaction(username, id);
            loadTransactions();
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
                            <button type="submit" className="btn-primary flex-1">
                                {editingId ? 'Update' : 'Save'} Transaction
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
