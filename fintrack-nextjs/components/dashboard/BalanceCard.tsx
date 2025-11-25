'use client';

import { useSettings } from '@/context/SettingsContext';
import { formatAmount } from '@/lib/utils';

interface BalanceCardProps {
    totalBalance: number;
    income: number;
    expenses: number;
}

export default function BalanceCard({ totalBalance, income, expenses }: BalanceCardProps) {
    const { settings } = useSettings();

    return (
        <div className="balance-card mb-8">
            <div className="relative z-10">
                <div className="text-sm opacity-90 mb-2">Total Balance</div>
                <div className="text-5xl font-bold mb-6">
                    {formatAmount(totalBalance, settings.symbol)}
                </div>
                <div className="flex gap-8">
                    <div>
                        <div className="text-xs opacity-80 mb-1">Income</div>
                        <div className="text-xl font-semibold">
                            + {formatAmount(income, settings.symbol)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs opacity-80 mb-1">Expense</div>
                        <div className="text-xl font-semibold">
                            - {formatAmount(expenses, settings.symbol)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
