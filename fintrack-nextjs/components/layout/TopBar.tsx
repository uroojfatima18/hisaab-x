'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUser } from '@/lib/storage';
import { Search, ChevronDown, LayoutDashboard, User, Settings, LogOut, Menu } from 'lucide-react';

interface TopBarProps {
    onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { username, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    useEffect(() => {
        if (username) {
            const user = getUser(username);
            if (user?.avatarUrl) {
                setAvatarUrl(user.avatarUrl);
            }
        }
    }, [username]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (searchQuery.trim()) {
                router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
                router.push('/transactions');
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            description: 'Visit your dashboard',
            onClick: () => {
                router.push('/dashboard');
                setIsDropdownOpen(false);
            },
        },
        {
            icon: User,
            label: 'Profile',
            description: 'View your public profile',
            onClick: () => {
                // You can add a profile page later
                alert('Profile page coming soon!');
                setIsDropdownOpen(false);
            },
        },
        {
            icon: Settings,
            label: 'Settings',
            description: 'Change your account settings',
            onClick: () => {
                router.push('/settings');
                setIsDropdownOpen(false);
            },
        },
    ];

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const displayAvatar = avatarUrl || defaultAvatar;

    return (
        <div className="flex items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-lg flex-shrink-0"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Bar */}
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-soft border border-white/50 w-full max-w-sm">
                    <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="bg-transparent outline-none text-slate-600 placeholder-slate-400 w-full min-w-0"
                    />
                </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 bg-white px-3 py-2 rounded-full shadow-soft cursor-pointer hover:-translate-y-0.5 transition-all"
                >
                    <img
                        src={displayAvatar}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full object-cover w-8 h-8"
                    />
                    <span className="font-semibold text-slate-900">{username}</span>
                    <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-hover border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <img
                                    src={displayAvatar}
                                    alt="Profile"
                                    width={48}
                                    height={48}
                                    className="rounded-full ring-2 ring-white object-cover w-12 h-12"
                                />
                                <div>
                                    <div className="font-semibold text-slate-900">{username}</div>
                                    <div className="text-sm text-slate-500">{username}@fintrack.app</div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        onClick={item.onClick}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{item.label}</div>
                                            <div className="text-xs text-slate-500">{item.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Logout Button */}
                        <div className="border-t border-slate-100 p-2">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left rounded-xl"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                    <LogOut className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-red-600">Logout</div>
                                    <div className="text-xs text-red-500">Sign out of your account</div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
