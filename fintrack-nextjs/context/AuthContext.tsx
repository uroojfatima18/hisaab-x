'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '@/types/user';
import * as api from '@/lib/api';

interface AuthContextType extends AuthState {
    user: api.User | null;
    loading: boolean;
    loginUser: (username: string, password: string) => Promise<void>;
    signupUser: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        username: null,
    });
    const [user, setUser] = useState<api.User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const { user } = await api.getCurrentUser();
            setUser(user);
            setAuthState({
                isAuthenticated: true,
                username: user.username,
            });
        } catch {
            setUser(null);
            setAuthState({
                isAuthenticated: false,
                username: null,
            });
        }
    };

    useEffect(() => {
        // Check if user is logged in on mount
        refreshUser().finally(() => setLoading(false));
    }, []);

    const loginUser = async (username: string, password: string) => {
        const { user } = await api.login(username, password);
        setUser(user);
        setAuthState({
            isAuthenticated: true,
            username: user.username,
        });
    };

    const signupUser = async (username: string, email: string, password: string) => {
        const { user } = await api.signup(username, email, password);
        setUser(user);
        setAuthState({
            isAuthenticated: true,
            username: user.username,
        });
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        setAuthState({
            isAuthenticated: false,
            username: null,
        });
    };

    return (
        <AuthContext.Provider value={{ ...authState, user, loading, loginUser, signupUser, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
