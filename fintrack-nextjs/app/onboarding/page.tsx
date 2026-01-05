'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getCurrencyOptions, CURRENCIES } from '@/constants/currencies';
import * as api from '@/lib/api';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [step, setStep] = useState(1);
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [initialBalance, setInitialBalance] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    const currencyOptions = getCurrencyOptions();

    const handleCurrencySubmit = async () => {
        setSaving(true);
        try {
            const currencyInfo = CURRENCIES[selectedCurrency];
            await updateSettings({
                currency: selectedCurrency,
                symbol: currencyInfo.symbol,
            });
            setStep(2);
        } catch (error) {
            console.error('Failed to save currency:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleBalanceSubmit = async () => {
        setSaving(true);
        try {
            const balance = parseFloat(initialBalance);

            // If user entered a balance, create an initial balance transaction
            if (balance > 0) {
                await api.createTransaction({
                    date: new Date().toISOString(),
                    type: 'income',
                    category: 'Initial Balance',
                    description: 'Starting Balance',
                    amountPaisa: Math.round(balance * 100),
                });
            }

            await updateSettings({
                setupComplete: true,
                initialBalance: Math.round(balance * 100) || 0
            });
            setStep(3);
        } catch (error) {
            console.error('Failed to save balance:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = () => {
        router.push('/dashboard');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#F2F4F8' }}>
            {/* Left Side - Premium Fintech Section */}
            <motion.div
                className="hidden lg:flex w-[480px] min-h-screen flex-col justify-between p-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #0A2A43 0%, #0d3a5c 60%, #115e59 100%)' }}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >

                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#2ECC71]/10 rounded-full blur-3xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-[-5%] right-[-5%] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-3xl"
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

                    {/* Floating particles */}
                    <motion.div
                        className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#2ECC71]/40 rounded-full"
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute top-[60%] left-[25%] w-1.5 h-1.5 bg-[#2ECC71]/30 rounded-full"
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                        className="absolute top-[40%] right-[20%] w-2.5 h-2.5 bg-teal-400/30 rounded-full"
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    />
                    <motion.div
                        className="absolute bottom-[30%] right-[30%] w-1.5 h-1.5 bg-emerald-400/40 rounded-full"
                        animate={{ y: [5, -15, 5] }}
                        transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
                    />
                </div>

                {/* Logo Section */}
                <motion.div
                    className="relative z-10"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                        <TrendingUp className="w-8 h-8 text-[#2ECC71]" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Hisaab<span className="text-[#2ECC71]">X</span>
                        </h1>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    {/* Headline */}
                    <motion.h2
                        className="text-3xl font-bold text-white mb-4 leading-tight"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Money, Finally<br /><span className="text-[#2ECC71]">Under Control</span>
                    </motion.h2>
                    <motion.p
                        className="text-white/60 text-base mb-8 max-w-[300px]"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        A simple and stress-free way to manage your finances
                    </motion.p>

                    {/* Feature Cards */}
                    <div className="space-y-3">
                        {[
                            { icon: 'chart', title: 'Track Expenses', desc: 'Monitor spending patterns', color: '#2ECC71', bgColor: 'bg-[#2ECC71]/20', delay: 0.5 },
                            { icon: 'dollar', title: 'Set Budgets', desc: 'Stay within your limits', color: '#3B82F6', bgColor: 'bg-blue-500/20', delay: 0.6 },
                            { icon: 'trending', title: 'View Analytics', desc: 'Insights & reports', color: '#8B5CF6', bgColor: 'bg-purple-500/20', delay: 0.7 }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group cursor-pointer"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: feature.delay, duration: 0.5 }}
                                whileHover={{ x: 10, scale: 1.02 }}
                            >
                                <motion.div
                                    className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center`}
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                >
                                    {feature.icon === 'chart' && (
                                        <svg className="w-5 h-5" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )}
                                    {feature.icon === 'dollar' && (
                                        <svg className="w-5 h-5" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    {feature.icon === 'trending' && (
                                        <svg className="w-5 h-5" style={{ color: feature.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    )}
                                </motion.div>
                                <div>
                                    <p className="text-white font-medium text-sm">{feature.title}</p>
                                    <p className="text-white/50 text-xs">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom Trust Indicators */}
                <motion.div
                    className="relative z-10 flex items-center justify-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    {[
                        { icon: 'shield', label: 'Secure' },
                        { icon: 'bolt', label: 'Fast' },
                        { icon: 'heart', label: 'Free' }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center gap-2"
                            whileHover={{ scale: 1.1 }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#2ECC71]/20 flex items-center justify-center">
                                {item.icon === 'shield' && (
                                    <svg className="w-4 h-4 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                )}
                                {item.icon === 'bolt' && (
                                    <svg className="w-4 h-4 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                )}
                                {item.icon === 'heart' && (
                                    <svg className="w-4 h-4 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white/70 text-sm font-medium">{item.label}</span>
                            {index < 2 && <div className="w-px h-6 bg-white/20 ml-4"></div>}
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Right Side - Content Section */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
                {/* Floating background elements */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-[#2ECC71]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#0A2A43]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                <div className="w-full max-w-2xl relative z-10">
                    {/* Mobile Logo - Only visible on smaller screens */}
                    <div className="lg:hidden text-center mb-6 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200">
                            <TrendingUp className="w-6 h-6 text-[#2ECC71]" />
                            <h1 className="text-xl font-bold" style={{ color: '#0A2A43' }}>
                                Hisaab<span style={{ color: '#2ECC71' }}>X</span>
                            </h1>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-primary-500 mb-2">Welcome! Let's get started</h2>
                        <p className="text-slate-500 text-sm">Set up your account in just a few steps</p>
                    </div>

                    {/* Stepper - Vertical Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3">
                            {/* Step 1 */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500 ${step >= 1
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 shadow-md'
                                : 'bg-white border border-slate-200'
                                }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-white text-accent-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                                </div>
                                <span className={`font-medium text-xs whitespace-nowrap ${step >= 1 ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Currency
                                </span>
                            </div>

                            {/* Connector */}
                            <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-accent-500' : 'bg-slate-200'
                                }`}></div>

                            {/* Step 2 */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500 ${step >= 2
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 shadow-md'
                                : 'bg-white border border-slate-200'
                                }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-white text-accent-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                                </div>
                                <span className={`font-medium text-xs whitespace-nowrap ${step >= 2 ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Balance
                                </span>
                            </div>

                            {/* Connector */}
                            <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-accent-500' : 'bg-slate-200'
                                }`}></div>

                            {/* Step 3 */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500 ${step >= 3
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 shadow-md'
                                : 'bg-white border border-slate-200'
                                }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 3 ? 'bg-white text-accent-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step >= 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                                </div>
                                <span className={`font-medium text-xs whitespace-nowrap ${step >= 3 ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Done
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transition-all duration-500 hover:shadow-3xl">
                    {/* Step 1: Currency Selection */}
                    {step === 1 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 rounded-2xl mb-6 shadow-lg">
                                    <span className="text-4xl">🌍</span>
                                </div>
                                <h2 className="text-3xl font-bold text-primary-500 mb-3">
                                    Choose Your Currency
                                </h2>
                                <p className="text-slate-500 text-lg">
                                    Select the currency you'll use most often
                                </p>
                            </div>

                            <div className="max-w-md mx-auto space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-primary-700 mb-3">
                                        Base Currency
                                    </label>
                                    <select
                                        value={selectedCurrency}
                                        onChange={(e) => setSelectedCurrency(e.target.value)}
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-500 text-primary-500 font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        {currencyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-accent-50/50 border border-accent-100 rounded-2xl p-5">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        💡 <strong>Tip:</strong> All transactions in other currencies will be calculated based on this one.
                                    </p>
                                </div>

                                <button
                                    onClick={handleCurrencySubmit}
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-5 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Continue →'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Initial Balance */}
                    {step === 2 && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 rounded-2xl mb-6 shadow-lg">
                                    <span className="text-4xl">💰</span>
                                </div>
                                <h2 className="text-3xl font-bold text-primary-500 mb-3">
                                    Set Your Starting Balance
                                </h2>
                                <p className="text-slate-500 text-lg">
                                    How much money do you have right now?
                                </p>
                            </div>

                            <div className="max-w-md mx-auto space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-primary-700 mb-3">
                                        Current Balance ({settings.symbol})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-500 text-primary-500 font-medium text-lg transition-all shadow-sm hover:shadow-md"
                                    />
                                </div>

                                <div className="bg-accent-50/50 border border-accent-100 rounded-2xl p-5">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        💡 <strong>Tip:</strong> This will be your starting point for tracking all expenses and income.
                                    </p>
                                </div>

                                <button
                                    onClick={handleBalanceSubmit}
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-5 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Complete Setup →'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="animate-slide-up text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full mb-8 shadow-2xl shadow-accent-300 animate-bounce-slow">
                                <CheckCircle2 className="w-14 h-14 text-white" />
                            </div>

                            <h2 className="text-4xl font-bold text-primary-500 mb-4">
                                You're All Set! 🎉
                            </h2>

                            <p className="text-slate-500 text-xl mb-12 max-w-md mx-auto">
                                Your account is ready. Let's start tracking your finances!
                            </p>

                            <button
                                onClick={handleFinish}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold px-12 py-5 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Go to Dashboard →
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
