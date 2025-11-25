'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { settings } = useSettings();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (!settings.setup_complete) {
            router.push('/onboarding');
        } else {
            router.push('/dashboard');
        }
    }, [isAuthenticated, settings.setup_complete, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-primary-500 text-xl font-medium">
                Loading...
            </div>
        </div>
    );
}
