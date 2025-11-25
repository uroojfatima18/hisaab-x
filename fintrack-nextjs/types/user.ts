export interface User {
    username: string;
    email: string;
    password: string; // Hashed
    question?: string;
    answer?: string; // Hashed
    avatarUrl?: string; // Custom avatar URL or base64 image
}

export interface UserSettings {
    currency: string;
    symbol: string;
    setup_complete: boolean;
}

export interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
}
