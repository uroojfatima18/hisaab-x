'use client';

import { Transaction } from '@/types/transaction';
import { useSettings } from '@/context/SettingsContext';
import { formatAmount, formatDateShort, getCategoryIcon } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface TransactionRowProps {
    transaction: Transaction;
    onDelete: () => void;
}

export default function TransactionRow({ transaction, onDelete }: TransactionRowProps) {
    const { settings } = useSettings();
    const Icon = getCategoryIcon(transaction.category);
    const isIncome = transaction.type === 'income';
    const color = isIncome ? '#10b981' : '#ef4444';
    const bgPill = isIncome ? '#d1fae5' : '#fee2e2';
    const sign = isIncome ? '+' : '-';

    return (
        <div className="tx-row group">
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: bgPill, color }}
                >
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="font-semibold text-slate-900">{transaction.category}</div>
                    <div className="text-sm text-slate-500">
                        {formatDateShort(transaction.date)} • {transaction.description}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-bold text-lg" style={{ color }}>
                        {sign} {formatAmount(transaction.amount_paisa, settings.symbol)}
                    </div>
                    <div
                        className="category-pill inline-block mt-1"
                        style={{ background: bgPill, color }}
                    >
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </div>
                </div>

                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg text-red-500"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
