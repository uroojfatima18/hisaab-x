'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfileOverlay() {
    const pathname = usePathname();
    const { username, isAuthenticated } = useAuth();

    // Don't show on dashboard pages as they have the TopBar
    // Don't show on auth pages (login, signup, forgot-password)
    if (pathname?.startsWith('/dashboard') ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/forgot-password' ||
        !isAuthenticated) {
        return null;
    }

    // Generate avatar URL using DiceBear
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    return (
        <div className="fixed top-6 right-6 z-50">
            <div className="flex items-center gap-3 bg-white rounded-full shadow-md px-4 py-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
                    <Image
                        src={avatarUrl}
                        alt={username || 'User'}
                        width={40}
                        height={40}
                        className="object-cover"
                    />
                </div>
                <span className="text-sm font-medium text-slate-900 pr-2">
                    {username}
                </span>
            </div>
        </div>
    );
}
