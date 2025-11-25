'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '@/types/user';

interface AuthContextType extends AuthState {
    login: (username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        username: null,
    });

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUsername = localStorage.getItem('currentUser');
        if (storedUsername) {
            setAuthState({
                isAuthenticated: true,
                username: storedUsername,
            });
        }
    }, []);

    const login = (username: string) => {
        localStorage.setItem('currentUser', username);
        setAuthState({
            isAuthenticated: true,
            username,
        });
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setAuthState({
            isAuthenticated: false,
            username: null,
        });
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
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
