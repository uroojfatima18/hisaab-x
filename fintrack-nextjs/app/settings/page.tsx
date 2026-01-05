'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getCurrencyOptions, CURRENCIES } from '@/constants/currencies';
import * as api from '@/lib/api';
import { AlertTriangle, Camera } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout, refreshUser } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.avatarUrl) {
            setAvatarUrl(user.avatarUrl);
        }
    }, [user]);

    useEffect(() => {
        setSelectedCurrency(settings.currency);
    }, [settings.currency]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setAvatarUrl(base64);

                try {
                    await api.updateUser({ avatarUrl: base64 });
                    await refreshUser();
                } catch (error) {
                    console.error('Failed to update avatar:', error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const currencyOptions = getCurrencyOptions();

    const handleCurrencyUpdate = async () => {
        setSaving(true);
        try {
            const currencyInfo = CURRENCIES[selectedCurrency];
            await updateSettings({
                currency: selectedCurrency,
                symbol: currencyInfo.symbol,
            });
            alert('Currency updated successfully!');
        } catch (error) {
            console.error('Failed to update currency:', error);
            alert('Failed to update currency');
        } finally {
            setSaving(false);
        }
    };

    const handleClearTransactions = async () => {
        if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            try {
                await api.deleteAllTransactions();
                alert('All transactions cleared!');
                router.push('/dashboard');
            } catch (error) {
                console.error('Failed to clear transactions:', error);
                alert('Failed to clear transactions');
            }
        }
    };

    const handleFactoryReset = async () => {
        if (
            confirm(
                'Are you sure you want to perform a factory reset? This will delete all your data including transactions, budgets, and settings. This cannot be undone.'
            )
        ) {
            try {
                await api.deleteAllTransactions();
                await api.deleteAllBudgets();
                await api.deleteUser();
                await logout();
                alert('Factory reset complete. Please create a new account.');
                router.push('/signup');
            } catch (error) {
                console.error('Failed to perform factory reset:', error);
                alert('Failed to perform factory reset');
            }
        }
    };

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
    const displayAvatar = avatarUrl || defaultAvatar;

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 shadow-soft mb-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-lg">
                            <img
                                src={displayAvatar}
                                alt={user?.username || 'User'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-slate-50 transition-colors">
                            <Camera className="w-4 h-4 text-slate-600" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                        </label>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.username}</h2>
                        <p className="text-slate-600 mb-3">{user?.email}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-slate-600">Active Account</span>
                            </div>
                            <div className="text-slate-400">•</div>
                            <span className="text-slate-600">Currency: {settings.currency} ({settings.symbol})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Preferences</h2>

                <div className="max-w-md">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="select-field mb-4"
                    >
                        {currencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button onClick={handleCurrencyUpdate} disabled={saving} className="btn-primary">
                        {saving ? 'Updating...' : 'Update Currency'}
                    </button>
                </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-1">Advanced Options</h2>
                        <p className="text-sm text-slate-600">
                            Manage your data and account settings
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                            <div className="font-semibold text-slate-900">Clear All Transactions</div>
                            <div className="text-sm text-slate-500">
                                Delete all transaction history (budgets will remain)
                            </div>
                        </div>
                        <button
                            onClick={handleClearTransactions}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                        >
                            Clear Transactions
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                            <div className="font-semibold text-slate-900">Factory Reset</div>
                            <div className="text-sm text-slate-500">
                                Delete all data and reset to initial state
                            </div>
                        </div>
                        <button
                            onClick={handleFactoryReset}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                        >
                            Factory Reset
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
