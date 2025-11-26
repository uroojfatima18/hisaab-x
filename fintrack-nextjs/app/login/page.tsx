'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUser } from '@/lib/storage';
import { verifyPassword } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = getUser(username);
            if (!user) {
                setError('Incorrect credentials');
                setLoading(false);
                return;
            }

            const isValid = await verifyPassword(password, user.password);
            if (!isValid) {
                setError('Incorrect credentials');
                setLoading(false);
                return;
            }

            login(username);
            router.push('/dashboard');
        } catch (err) {
            setError('An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F2F4F8' }}>
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-hover p-10 text-center">
                    {/* Logo */}
                    <div className="mb-4">
                        <div className="w-60 h-28 mx-auto relative">
                            <Image
                                src="/logo.png"
                                alt="HissabX Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="mt-0 text-lg font-bold leading-tight" style={{ color: '#0A2A43' }}>
                            Your Finances<br />
                            in One Place
                        </p>
                    </div>

                    <p className="mb-8" style={{ color: '#0A2A43' }}>
                        <span className="text-lg font-medium">Sign in to your account</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    borderColor: '#E5E7EB',
                                    backgroundColor: '#F2F4F8'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2ECC71'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    borderColor: '#E5E7EB',
                                    backgroundColor: '#F2F4F8'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2ECC71'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
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

                        {error && (
                            <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#2ECC71' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Link href="/signup">
                            <button
                                className="w-full py-3 rounded-xl font-medium transition-all border-2 text-sm"
                                style={{
                                    color: '#0A2A43',
                                    borderColor: '#0A2A43',
                                    backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0A2A43';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0A2A43';
                                }}
                            >
                                Create Account
                            </button>
                        </Link>
                        <Link href="/forgot-password">
                            <button
                                className="w-full py-3 rounded-xl font-medium transition-all border-2 text-sm"
                                style={{
                                    color: '#0A2A43',
                                    borderColor: '#0A2A43',
                                    backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0A2A43';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#0A2A43';
                                }}
                            >
                                Forgot Password?
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
