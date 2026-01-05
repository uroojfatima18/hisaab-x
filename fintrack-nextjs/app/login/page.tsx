'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { loginUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginUser(username, password);
            setShowSuccess(true);
            setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 500);
            }, 1000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Incorrect credentials';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleNavigate = (path: string) => {
        setIsExiting(true);
        setTimeout(() => {
            router.push(path);
        }, 500);
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="min-h-screen flex relative overflow-hidden"
                style={{ backgroundColor: '#F2F4F8' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Success Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-[#0A2A43] via-[#0d3a5c] to-[#115e59]"
                                initial={{ scale: 0, borderRadius: '100%' }}
                                animate={{ scale: 3, borderRadius: '0%' }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="relative z-10 text-center"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                            >
                                <motion.div
                                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#2ECC71] flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                                >
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                                <motion.h2
                                    className="text-2xl font-bold text-white"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Welcome Back!
                                </motion.h2>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Left Side - Premium Fintech Section */}
                <motion.div
                    className="hidden lg:flex w-[480px] min-h-screen flex-col justify-between p-8 relative overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #0A2A43 0%, #0d3a5c 60%, #115e59 100%)' }}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: isExiting ? -100 : 0, opacity: isExiting ? 0 : 1 }}
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
                            Welcome Back,<br /><span className="text-[#2ECC71]">Let&apos;s Continue</span>
                        </motion.h2>
                        <motion.p
                            className="text-white/60 text-base mb-8 max-w-[300px]"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            Your financial journey awaits. Sign in to access your dashboard.
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
                <motion.div
                    className="flex-1 flex items-center justify-center px-4 py-8 relative"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: isExiting ? 100 : 0, opacity: isExiting ? 0 : 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {/* Floating background elements */}
                    <div className="absolute top-20 right-10 w-72 h-72 bg-[#2ECC71]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                    <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#0A2A43]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                    <div className="w-full max-w-md relative z-10">
                        {/* Mobile Logo */}
                        <motion.div
                            className="lg:hidden text-center mb-6"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200">
                                <TrendingUp className="w-6 h-6 text-[#2ECC71]" />
                                <h1 className="text-xl font-bold" style={{ color: '#0A2A43' }}>
                                    Hisaab<span style={{ color: '#2ECC71' }}>X</span>
                                </h1>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-3xl shadow-xl p-8 text-center"
                            initial={{ y: 30, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                        >
                            {/* Header */}
                            <motion.div
                                className="mb-4 text-center"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h1 className="text-xl font-bold leading-tight">
                                    <span style={{ color: '#0A2A43' }}>Your Finances</span>{' '}
                                    <span style={{ color: '#2ECC71' }}>in One Place</span>
                                </h1>
                            </motion.div>

                            <motion.p
                                className="mb-8 text-lg font-bold"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Welcome to <span style={{ color: '#0A2A43' }}>Hisaab</span><span style={{ color: '#2ECC71' }}>X</span>
                            </motion.p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <motion.div
                                    initial={{ x: 30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
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
                                </motion.div>

                                <motion.div
                                    className="relative"
                                    initial={{ x: 30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.55 }}
                                >
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
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </motion.div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            className="px-4 py-3 rounded-xl text-sm"
                                            style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: '#2ECC71' }}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.span
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                            Signing in...
                                        </span>
                                    ) : 'Sign In'}
                                </motion.button>
                            </form>

                            <motion.div
                                className="mt-6 grid grid-cols-2 gap-3"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <motion.button
                                    onClick={() => handleNavigate('/signup')}
                                    className="w-full py-3 rounded-xl font-medium transition-all border-2 text-sm"
                                    style={{
                                        color: '#0A2A43',
                                        borderColor: '#0A2A43',
                                        backgroundColor: 'transparent'
                                    }}
                                    whileHover={{
                                        backgroundColor: '#0A2A43',
                                        color: 'white',
                                        scale: 1.02
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Create Account
                                </motion.button>
                                <motion.button
                                    onClick={() => handleNavigate('/forgot-password')}
                                    className="w-full py-3 rounded-xl font-medium transition-all border-2 text-sm"
                                    style={{
                                        color: '#0A2A43',
                                        borderColor: '#0A2A43',
                                        backgroundColor: 'transparent'
                                    }}
                                    whileHover={{
                                        backgroundColor: '#0A2A43',
                                        color: 'white',
                                        scale: 1.02
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Forgot Password?
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
