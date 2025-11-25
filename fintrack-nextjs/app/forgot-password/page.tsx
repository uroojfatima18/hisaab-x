'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, saveUser } from '@/lib/storage';
import { hashPassword } from '@/lib/auth';
import { Mail, KeyRound, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [enteredCode, setEnteredCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [foundUsername, setFoundUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const generateCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Find user by email
        const users = getAllUsers();
        const userEntry = Object.entries(users).find(([_, user]) => user.email === email);

        if (!userEntry) {
            setError('No account found with this email address');
            return;
        }

        const [username] = userEntry;
        setFoundUsername(username);

        // Generate and "send" verification code
        const code = generateCode();
        setVerificationCode(code);

        // In a real app, you would send this via email
        // For demo purposes, we'll show it in console and alert
        console.log(`Verification code for ${email}: ${code}`);
        alert(`📧 Verification Code Sent!\n\nYour code is: ${code}\n\n(In a real app, this would be sent to your email)`);

        setStep('code');
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (enteredCode !== verificationCode) {
            setError('Invalid verification code');
            return;
        }

        setStep('reset');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 4) {
            setError('Password too short (minimum 4 characters)');
            return;
        }

        setLoading(true);

        try {
            const users = getAllUsers();
            const user = users[foundUsername];
            const hashedPassword = await hashPassword(newPassword);

            saveUser(foundUsername, {
                ...user,
                password: hashedPassword,
            });

            login(foundUsername);
            alert('✅ Password reset successful!');
            router.push('/dashboard');
        } catch (err) {
            setError('An error occurred');
            setLoading(false);
        }
    };

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
                            {step === 'email' && "We'll send you a verification code"}
                            {step === 'code' && "Enter the code sent to your email"}
                            {step === 'reset' && "Create a new password"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className="space-y-6">
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
                                Send Verification Code
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 'code' && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                                    <KeyRound className="w-8 h-8 text-accent-600" />
                                </div>
                                <p className="text-sm text-slate-600">
                                    Code sent to <strong>{email}</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-primary-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={enteredCode}
                                    onChange={(e) => setEnteredCode(e.target.value)}
                                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-500 text-primary-500 text-center text-2xl font-bold tracking-widest transition-all"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-4 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02]"
                            >
                                Verify Code
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-slate-600 hover:text-primary-500 font-medium transition-colors"
                            >
                                ← Back to email
                            </button>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                                    <Lock className="w-8 h-8 text-accent-600" />
                                </div>
                                <p className="text-sm text-slate-600">
                                    Create a new password for <strong>{foundUsername}</strong>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-primary-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-4 pr-12 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-500 text-primary-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-primary-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-4 pr-12 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-500 text-primary-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold py-4 rounded-2xl hover:from-accent-700 hover:to-accent-600 transition-all duration-300 shadow-xl shadow-accent-200 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-slate-600 hover:text-primary-500 font-medium transition-colors"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
