'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as api from '@/lib/api';

interface SettingsContextType {
    settings: {
        currency: string;
        symbol: string;
        setup_complete: boolean;
        initialBalance: number;
    };
    loading: boolean;
    updateSettings: (updates: Partial<{
        currency: string;
        symbol: string;
        setupComplete: boolean;
        initialBalance: number;
    }>) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [settings, setSettings] = useState({
        currency: 'USD',
        symbol: '$',
        setup_complete: false,
        initialBalance: 0,
    });
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            const { settings: apiSettings } = await api.getSettings();
            setSettings({
                currency: apiSettings.currency,
                symbol: apiSettings.symbol,
                setup_complete: apiSettings.setupComplete,
                initialBalance: apiSettings.initialBalance,
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshSettings();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const updateSettings = async (updates: Partial<{
        currency: string;
        symbol: string;
        setupComplete: boolean;
        initialBalance: number;
    }>) => {
        try {
            const { settings: apiSettings } = await api.updateSettings(updates);
            setSettings({
                currency: apiSettings.currency,
                symbol: apiSettings.symbol,
                setup_complete: apiSettings.setupComplete,
                initialBalance: apiSettings.initialBalance,
            });
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
