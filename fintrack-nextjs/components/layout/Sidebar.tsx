'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Target,
    Settings,
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Transactions', href: '/transactions' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Target, label: 'Budgets', href: '/budgets' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { username } = useAuth();

    return (
        <div className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-white/50 flex flex-col">
            {/* Logo */}
            <div className="pt-6 px-4 pb-4">
                <div className="flex justify-center">
                    <Image
                        src="/logo.png"
                        alt="HissabX Logo"
                        width={250}
                        height={250}
                        className="object-contain"
                    />
                </div>
                <p className="text-xs text-slate-500 text-center">Logged in as <span className="font-medium">{username}</span></p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all cursor-pointer ${isActive
                                    ? 'bg-gradient-primary text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">© 2025 FinTrack</p>
            </div>
        </div>
    );
}

