'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceTrendChart from '@/components/charts/BalanceTrendChart';
import CashFlowChart from '@/components/charts/CashFlowChart';
import { getTransactions } from '@/lib/storage';
import { Transaction, EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/types/transaction';
import { formatAmount, getCategoryIcon } from '@/lib/utils';

export default function AnalyticsPage() {
    const { username } = useAuth();
    const { settings } = useSettings();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<'reports' | 'trend' | 'cashflow'>('reports');

    // Filters
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
            start: startOfMonth.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0],
        };
    });

    useEffect(() => {
        if (username) {
            loadTransactions();
        }
    }, [username]);

    const loadTransactions = () => {
        if (!username) return;
        setTransactions(getTransactions(username));
    };

    // Filter transactions
    const filteredTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return tDate >= start && tDate <= end;
    });

    // Calculate metrics
    const totalIncome = filteredTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount_paisa, 0);

    const totalExpense = filteredTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount_paisa, 0);

    const netBalance = totalIncome - totalExpense;

    // Category breakdown
    const categoryData = filteredTransactions.reduce((acc, t) => {
        const key = `${t.category}-${t.type}`;
        if (!acc[key]) {
            acc[key] = { category: t.category, type: t.type, amount: 0 };
        }
        acc[key].amount += t.amount_paisa;
        return acc;
    }, {} as Record<string, { category: string; type: string; amount: number }>);

    const categoryBreakdown = Object.values(categoryData).sort((a, b) => b.amount - a.amount);

    // Balance trend data
    const balanceTrendData = filteredTransactions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((acc, t, index) => {
            const prevBalance = index > 0 ? acc[index - 1].balance : 0;
            const change = t.type === 'income' ? t.amount_paisa : -t.amount_paisa;
            acc.push({
                date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                balance: (prevBalance + change) / 100,
            });
            return acc;
        }, [] as Array<{ date: string; balance: number }>);

    // Cash flow data (group by date)
    const cashFlowMap = filteredTransactions.reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = { date, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            acc[date].income += t.amount_paisa / 100;
        } else {
            acc[date].expense += t.amount_paisa / 100;
        }
        return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    const cashFlowData = Object.values(cashFlowMap).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Analytics</h1>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Filters</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="text-sm text-slate-500 mb-1">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">
                        {formatAmount(totalIncome, settings.symbol)}
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="text-sm text-slate-500 mb-1">Total Expense</div>
                    <div className="text-2xl font-bold text-red-600">
                        {formatAmount(totalExpense, settings.symbol)}
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <div className="text-sm text-slate-500 mb-1">Net Balance</div>
                    <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(netBalance, settings.symbol)}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="flex border-b border-slate-200">
                    {[
                        { id: 'reports', label: 'Reports' },
                        { id: 'trend', label: 'Balance Trend' },
                        { id: 'cashflow', label: 'Cash Flow' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h3>
                            {categoryBreakdown.length > 0 ? (
                                <div className="space-y-3">
                                    {categoryBreakdown.map((item) => {
                                        const Icon = getCategoryIcon(item.category);
                                        const isIncome = item.type === 'income';
                                        const color = isIncome ? '#10b981' : '#ef4444';
                                        const bgColor = isIncome ? '#d1fae5' : '#fee2e2';
                                        const totalVolume = totalIncome + totalExpense;
                                        const percentage = totalVolume > 0 ? (item.amount / totalVolume) * 100 : 0;

                                        return (
                                            <div
                                                key={`${item.category}-${item.type}`}
                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                        style={{ background: bgColor, color }}
                                                    >
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{item.category}</div>
                                                        <div
                                                            className="category-pill inline-block mt-1"
                                                            style={{ background: bgColor, color }}
                                                        >
                                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg text-slate-900">
                                                        {formatAmount(item.amount, settings.symbol)}
                                                    </div>
                                                    <div className="text-sm text-slate-500">{percentage.toFixed(1)}%</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-8">No data available</p>
                            )}
                        </div>
                    )}

                    {/* Balance Trend Tab */}
                    {activeTab === 'trend' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Balance Over Time</h3>
                            {balanceTrendData.length > 0 ? (
                                <BalanceTrendChart data={balanceTrendData} />
                            ) : (
                                <p className="text-slate-500 text-center py-8">No data available</p>
                            )}
                        </div>
                    )}

                    {/* Cash Flow Tab */}
                    {activeTab === 'cashflow' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Income vs Expense</h3>
                            {cashFlowData.length > 0 ? (
                                <CashFlowChart data={cashFlowData} />
                            ) : (
                                <p className="text-slate-500 text-center py-8">No data available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
