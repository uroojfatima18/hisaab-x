import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Utensils,
    Car,
    ShoppingBag,
    FileText,
    Film,
    Heart,
    Circle,
    Wallet,
    Laptop,
    Building2,
    TrendingUp,
    Gift,
    type LucideIcon
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatAmount(amountPaisa: number, symbol: string = '₹'): string {
    const amount = amountPaisa / 100;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    Food: Utensils,
    Transport: Car,
    Shopping: ShoppingBag,
    Bills: FileText,
    Entertainment: Film,
    Health: Heart,
    Other: Circle,
    Salary: Wallet,
    Freelance: Laptop,
    Business: Building2,
    Investment: TrendingUp,
    Gift: Gift,
    'Initial Balance': Wallet,
};

export function getCategoryIcon(category: string): LucideIcon {
    return CATEGORY_ICONS[category] || Circle;
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
