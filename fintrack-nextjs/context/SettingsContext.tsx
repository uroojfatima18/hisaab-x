'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings } from '@/types/user';
import { getUserSettings, saveUserSettings } from '@/lib/storage';
import { useAuth } from './AuthContext';

interface SettingsContextType {
    settings: UserSettings;
    updateSettings: (updates: Partial<UserSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { username } = useAuth();
    const [settings, setSettings] = useState<UserSettings>({
        currency: 'INR',
        symbol: '₹',
        setup_complete: false,
    });

    useEffect(() => {
        if (username) {
            const userSettings = getUserSettings(username);
            setSettings(userSettings);
        }
    }, [username]);

    const updateSettings = (updates: Partial<UserSettings>) => {
        if (!username) return;

        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        saveUserSettings(username, newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
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
