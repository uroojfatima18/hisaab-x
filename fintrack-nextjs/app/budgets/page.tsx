'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getBudgets, addOrUpdateBudget, deleteBudget, getTransactions } from '@/lib/storage';
import { Budget } from '@/types/budget';
import { EXPENSE_CATEGORIES } from '@/types/transaction';
import { formatAmount } from '@/lib/utils';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function BudgetsPage() {
    const { username } = useAuth();
    const { settings } = useSettings();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);

    // Form state
    const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
    const [limit, setLimit] = useState('');
    const [yearlyLimit, setYearlyLimit] = useState('');

    useEffect(() => {
        if (username) {
            loadBudgets();
        }
    }, [username]);

    const loadBudgets = () => {
        if (!username) return;
        setBudgets(getBudgets(username));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        addOrUpdateBudget(username, {
            category: editingCategory || category,
            limit: Math.round(parseFloat(limit) * 100),
            yearlyLimit: yearlyLimit ? Math.round(parseFloat(yearlyLimit) * 100) : undefined,
        });

        resetForm();
        loadBudgets();
        setShowForm(false);
    };

    const handleEdit = (budget: Budget) => {
        setEditingCategory(budget.category);
        setCategory(budget.category);
        setLimit((budget.limit / 100).toString());
        setYearlyLimit(budget.yearlyLimit ? (budget.yearlyLimit / 100).toString() : '');
        setShowForm(true);
    };

    const handleDelete = (category: string) => {
        if (!username) return;
        if (confirm(`Delete budget for ${category}?`)) {
            deleteBudget(username, category);
            loadBudgets();
        }
    };

    const resetForm = () => {
        setCategory(EXPENSE_CATEGORIES[0]);
        setLimit('');
        setYearlyLimit('');
        setEditingCategory(null);
    };

    // Calculate budget utilization
    const budgetData = budgets.map((budget) => {
        if (!username) return { ...budget, spent: 0, percentage: 0, spentYearly: 0, percentageYearly: 0 };

        const transactions = getTransactions(username);
        const now = new Date();

        // Monthly Data
        const currentMonthTransactions = transactions.filter((t) => {
            const tDate = new Date(t.date);
            return (
                tDate.getMonth() === now.getMonth() &&
                tDate.getFullYear() === now.getFullYear() &&
                t.type === 'expense' &&
                t.category === budget.category
            );
        });

        const spent = currentMonthTransactions.reduce((sum, t) => sum + t.amount_paisa, 0);
        const percentage = (spent / budget.limit) * 100;

        // Yearly Data
        const currentYearTransactions = transactions.filter((t) => {
            const tDate = new Date(t.date);
            return (
                tDate.getFullYear() === now.getFullYear() &&
                t.type === 'expense' &&
                t.category === budget.category
            );
        });

        const spentYearly = currentYearTransactions.reduce((sum, t) => sum + t.amount_paisa, 0);
        const percentageYearly = budget.yearlyLimit ? (spentYearly / budget.yearlyLimit) * 100 : 0;

        return { ...budget, spent, percentage, spentYearly, percentageYearly };
    });

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Set Budget
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {editingCategory ? `Edit Budget: ${editingCategory}` : 'Set New Budget'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="select-field"
                                disabled={!!editingCategory}
                            >
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Monthly Limit ({settings.symbol})
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="input-field"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Yearly Limit ({settings.symbol}) <span className="text-slate-400 text-xs">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={yearlyLimit}
                                onChange={(e) => setYearlyLimit(e.target.value)}
                                className="input-field"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-3 flex gap-3 mt-2">
                            <button type="submit" className="btn-primary flex-1">
                                {editingCategory ? 'Update' : 'Set'} Budget
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

            {/* Budgets List */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                {budgetData.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {budgetData.map((budget) => {
                            // Monthly Calculations
                            const limitAmount = budget.limit / 100;
                            const spentAmount = budget.spent / 100;
                            const remaining = limitAmount - spentAmount;
                            const percentage = budget.percentage;

                            let statusColor = '#10b981';
                            let statusBg = '#d1fae5';
                            let statusText = 'On Track';

                            if (percentage >= 100) {
                                statusColor = '#ef4444';
                                statusBg = '#fee2e2';
                                statusText = 'Over Budget';
                            } else if (percentage >= 80) {
                                statusColor = '#f59e0b';
                                statusBg = '#fef3c7';
                                statusText = 'Warning';
                            }

                            // Yearly Calculations
                            const yearlyLimitAmount = budget.yearlyLimit ? budget.yearlyLimit / 100 : 0;
                            const spentYearlyAmount = budget.spentYearly ? budget.spentYearly / 100 : 0;
                            const remainingYearly = yearlyLimitAmount - spentYearlyAmount;
                            const percentageYearly = budget.percentageYearly || 0;

                            return (
                                <div
                                    key={budget.category}
                                    className="p-6 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{budget.category}</h3>
                                            <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                                <span>Monthly: {formatAmount(budget.spent, settings.symbol)} / {formatAmount(budget.limit, settings.symbol)}</span>
                                                {budget.yearlyLimit && (
                                                    <>
                                                        <span className="text-slate-300">|</span>
                                                        <span>Yearly: {formatAmount(budget.spentYearly || 0, settings.symbol)} / {formatAmount(budget.yearlyLimit, settings.symbol)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div
                                                className="category-pill"
                                                style={{ background: statusBg, color: statusColor }}
                                            >
                                                {statusText}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(budget)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(budget.category)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monthly Progress Bar */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            <span>Monthly Progress</span>
                                            <span style={{ color: statusColor }}>{percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-300 rounded-full"
                                                style={{
                                                    width: `${Math.min(percentage, 100)}%`,
                                                    background: statusColor,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Yearly Progress Bar (if set) */}
                                    {budget.yearlyLimit && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                <span>Yearly Progress</span>
                                                <span className="text-slate-700">{percentageYearly.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-300 rounded-full bg-blue-500"
                                                    style={{
                                                        width: `${Math.min(percentageYearly, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">🎯</div>
                        <p className="text-slate-500">No budgets set. Create your first budget!</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
