import { Transaction } from '@/types/transaction';
import { Budget } from '@/types/budget';
import { User, UserSettings } from '@/types/user';

// Users storage
export function getUsers(): Record<string, User> {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : {};
}

export const getAllUsers = getUsers; // Alias for clarity

export function saveUser(username: string, user: User): void {
    const users = getUsers();
    users[username] = user;
    localStorage.setItem('users', JSON.stringify(users));
}

export function getUser(username: string): User | null {
    const users = getUsers();
    return users[username] || null;
}

// User settings
export function getUserSettings(username: string): UserSettings {
    if (typeof window === 'undefined') return { currency: 'INR', symbol: '₹', setup_complete: false };
    const data = localStorage.getItem(`settings_${username}`);
    return data ? JSON.parse(data) : { currency: 'INR', symbol: '₹', setup_complete: false };
}

export function saveUserSettings(username: string, settings: UserSettings): void {
    localStorage.setItem(`settings_${username}`, JSON.stringify(settings));
}

// Transactions
export function getTransactions(username: string): Transaction[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`transactions_${username}`);
    return data ? JSON.parse(data) : [];
}

export function saveTransactions(username: string, transactions: Transaction[]): void {
    localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
}

export function addTransaction(username: string, transaction: Transaction): void {
    const transactions = getTransactions(username);
    transactions.push(transaction);
    saveTransactions(username, transactions);
}

export function updateTransaction(username: string, id: string, updates: Partial<Transaction>): void {
    const transactions = getTransactions(username);
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        saveTransactions(username, transactions);
    }
}

export function deleteTransaction(username: string, id: string): void {
    const transactions = getTransactions(username);
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(username, filtered);
}

// Budgets
export function getBudgets(username: string): Budget[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`budgets_${username}`);
    return data ? JSON.parse(data) : [];
}

export function saveBudgets(username: string, budgets: Budget[]): void {
    localStorage.setItem(`budgets_${username}`, JSON.stringify(budgets));
}

export function addOrUpdateBudget(username: string, budget: Budget): void {
    const budgets = getBudgets(username);
    const index = budgets.findIndex(b => b.category === budget.category);
    if (index !== -1) {
        budgets[index] = budget;
    } else {
        budgets.push(budget);
    }
    saveBudgets(username, budgets);
}

export function deleteBudget(username: string, category: string): void {
    const budgets = getBudgets(username);
    const filtered = budgets.filter(b => b.category !== category);
    saveBudgets(username, filtered);
}

// Clear all data
export function clearAllTransactions(username: string): void {
    localStorage.removeItem(`transactions_${username}`);
}

export function clearAllBudgets(username: string): void {
    localStorage.removeItem(`budgets_${username}`);
}

export function factoryReset(username: string): void {
    clearAllTransactions(username);
    clearAllBudgets(username);
    localStorage.removeItem(`settings_${username}`);
}
