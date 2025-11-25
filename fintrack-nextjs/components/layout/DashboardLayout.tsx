'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { settings } = useSettings();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (!settings.setup_complete) {
            router.push('/onboarding');
        }
    }, [isAuthenticated, settings.setup_complete, router]);

    if (!isAuthenticated || !settings.setup_complete) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-primary-500 text-xl font-medium">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen relative bg-[#F2F4F8]">
            <Sidebar />
            <div className="flex-1 p-4 md:p-8 w-full min-w-0">
                <TopBar />
                <main>{children}</main>
            </div>
        </div>
    );
}
