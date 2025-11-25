'use client';

import { type LucideIcon } from 'lucide-react';

interface ActionCardProps {
    icon: LucideIcon;
    title: string;
    color: string;
    bgColor: string;
    onClick: () => void;
}

export default function ActionCard({ icon: Icon, title, color, bgColor, onClick }: ActionCardProps) {
    return (
        <div className="action-card" onClick={onClick}>
            <div className="icon-box" style={{ background: bgColor, color }}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="font-semibold text-sm text-slate-700">{title}</div>
        </div>
    );
}
