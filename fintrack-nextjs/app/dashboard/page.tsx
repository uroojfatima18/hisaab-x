'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ActionCard from '@/components/dashboard/ActionCard';
import TransactionRow from '@/components/dashboard/TransactionRow';
import * as api from '@/lib/api';
import { Minus, Plus, ShoppingBag, Target } from 'lucide-react';

interface TransactionDisplay {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount_paisa: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { transactions: data } = await api.getTransactions();
            setTransactions(data.map(t => ({
                id: t.id,
                date: t.date.split('T')[0],
                type: t.type as 'income' | 'expense',
                category: t.category,
                description: t.description,
                amount_paisa: t.amountPaisa,
            })));
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate current month data
    const now = new Date();
    const currentMonthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount_paisa, 0);

    const expenses = currentMonthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount_paisa, 0);

    const totalBalance = transactions
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount_paisa : -t.amount_paisa), 0);

    // Recent transactions
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const handleDeleteTransaction = async (id: string) => {
        if (confirm('Delete this transaction?')) {
            try {
                await api.deleteTransaction(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete transaction:', error);
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-slate-500">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <BalanceCard totalBalance={totalBalance} income={income} expenses={expenses} />

            {/* Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <ActionCard
                    icon={Minus}
                    title="Add Expense"
                    color="#ef4444"
                    bgColor="#fee2e2"
                    onClick={() => router.push('/transactions?type=expense')}
                />
                <ActionCard
                    icon={Plus}
                    title="Add Income"
                    color="#10b981"
                    bgColor="#d1fae5"
                    onClick={() => router.push('/transactions?type=income')}
                />
                <ActionCard
                    icon={ShoppingBag}
                    title="Shopping"
                    color="#8b5cf6"
                    bgColor="#ede9fe"
                    onClick={() => router.push('/transactions?type=expense&category=Shopping')}
                />
                <ActionCard
                    icon={Target}
                    title="Set Budget"
                    color="#3b82f6"
                    bgColor="#dbeafe"
                    onClick={() => router.push('/budgets')}
                />
            </div>

            {/* Recent Transactions */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Transactions</h2>
                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.id}
                                transaction={transaction}
                                onDelete={() => handleDeleteTransaction(transaction.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-slate-500">No transactions yet</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
