'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getCurrencyOptions, CURRENCIES } from '@/constants/currencies';
import { addTransaction } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const { username, isAuthenticated } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [step, setStep] = useState(1);
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [initialBalance, setInitialBalance] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const currencyOptions = getCurrencyOptions();

    const handleCurrencySubmit = () => {
        const currencyInfo = CURRENCIES[selectedCurrency];
        updateSettings({
            currency: selectedCurrency,
            symbol: currencyInfo.symbol,
        });
        setStep(2);
    };

    const handleBalanceSubmit = () => {
        const balance = parseFloat(initialBalance);
        if (balance > 0 && username) {
            addTransaction(username, {
                id: generateId(),
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                category: 'Initial Balance',
                description: 'Starting Balance',
                amount_paisa: Math.round(balance * 100),
            });
        }

        updateSettings({ setup_complete: true });
        setStep(3);
    };

    const handleFinish = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Logo Section - Top Center */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-block mb-6">
                        <div className="w-80 h-80 relative mx-auto drop-shadow-2xl">
                            <Image
                                src="/logo.png"
                                alt="HisaabX Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-primary-500 mb-2 tracking-tight">
                        Welcome to Hisaab<span style={{ color: '#2ECC71' }}>X</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Let's set up your account in just a few steps</p>
                </div>

                {/* Stepper - Horizontal Progress Indicator */}
                <div className="mb-16">
                    <div className="flex items-center justify-center gap-4 max-w-3xl mx-auto">
                        {/* Step 1 */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 ${step >= 1
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg shadow-accent-200 scale-105'
                                : 'bg-white border-2 border-slate-200'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-white text-accent-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                                </div>
                                <span className={`font-semibold text-sm whitespace-nowrap ${step >= 1 ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Select base currency
                                </span>
                            </div>
                        </div>

                        {/* Connector Line */}
                        <div className={`h-1 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-accent-500' : 'bg-slate-200'
                            }`}></div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 ${step >= 2
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg shadow-accent-200 scale-105'
                                : 'bg-white border-2 border-slate-200'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-white text-accent-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                                </div>
                                <span className={`font-semibold text-sm whitespace-nowrap ${step >= 2 ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Set up cash balance
                                </span>
                            </div>
                        </div>

                        {/* Connector Line */}
                        <div className={`h-1 w-16 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-accent-500' : 'bg-slate-200'
                            }`}></div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 ${step >= 3
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg shadow-accent-200 scale-105'
                                : 'bg-white border-2 border-slate-200'
                                }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 3 ? 'bg-white text-accent-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step >= 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                                </div>
                                <span className={`font-semibold text-sm whitespace-nowrap ${step >= 3 ? 'text-white' : 'text-slate-400'
                                    }`}>
                                    Success!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 max-w-2xl mx-auto transition-all duration-500 hover:shadow-3xl">
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
                                    className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-5 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Continue →
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
                                    className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-5 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Complete Setup →
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
