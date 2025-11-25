'use client';

import { useSettings } from '@/context/SettingsContext';
import { formatAmount } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface InsightCardProps {
    category: string;
    spent: number;
    limit: number;
    type: 'over' | 'warning';
}

export default function InsightCard({ category, spent, limit, type }: InsightCardProps) {
    const { settings } = useSettings();
    const percentage = (spent / limit) * 100;

    const config = {
        over: {
            bg: '#fef2f2',
            border: '#fee2e2',
            text: '#ef4444',
            darkText: '#7f1d1d',
            barBg: '#fee2e2',
            barColor: '#ef4444',
        },
        warning: {
            bg: '#fffbeb',
            border: '#fef3c7',
            text: '#d97706',
            darkText: '#78350f',
            barBg: '#fef3c7',
            barColor: '#f59e0b',
        },
    };

    const colors = config[type];

    return (
        <div
            className="p-4 rounded-2xl border mb-3"
            style={{ background: colors.bg, borderColor: colors.border }}
        >
            <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.text }} />
                <div>
                    <div className="font-semibold" style={{ color: colors.text }}>
                        {category} {type === 'over' ? 'Alert' : 'Warning'}
                    </div>
                    <div className="text-sm mt-1" style={{ color: colors.darkText }}>
                        {type === 'over'
                            ? `Over budget by ${formatAmount((spent - limit) * 100, settings.symbol)}`
                            : `${percentage.toFixed(0)}% of budget used`}
                    </div>
                </div>
            </div>

            <div className="h-1 rounded-full mt-3" style={{ background: colors.barBg }}>
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: colors.barColor,
                    }}
                />
            </div>
        </div>
    );
}
