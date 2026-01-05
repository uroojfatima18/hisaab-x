'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        // In production, this would call an API to send a password reset email
        // For now, we just show a success message
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-white to-accent-50">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 text-center">
                        <div className="w-60 h-60 mx-auto relative mb-6">
                            <Image
                                src="/logo.png"
                                alt="HisaabX Logo"
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Check Your Email</h2>

                        <p className="text-slate-600 mb-6">
                            If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 text-left">
                                    <strong>Note:</strong> Email sending is not configured in this demo. Please contact support or create a new account.
                                </p>
                            </div>
                        </div>

                        <Link href="/login">
                            <button className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-4 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02]">
                                Back to Login
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-white to-accent-50">
            <div className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="w-60 h-60 mx-auto relative">
                            <Image
                                src="/logo.png"
                                alt="HisaabX Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-slate-500 mt-4">
                            Enter your email to receive password reset instructions
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-primary-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-500 text-primary-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-4 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02]"
                        >
                            Send Reset Instructions
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-slate-600 hover:text-primary-500 font-medium transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
