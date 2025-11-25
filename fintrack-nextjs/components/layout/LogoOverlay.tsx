'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function LogoOverlay() {
    const pathname = usePathname();

    // Don't show on dashboard pages as they have the sidebar
    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    return (
        <div className="fixed top-0 left-4 z-50 pt-2">
            <div className="w-60 h-60 relative">
                <Image
                    src="/logo.png"
                    alt="HisaabX Logo"
                    fill
                    className="object-contain drop-shadow-lg"
                />
            </div>
        </div>
    );
}
