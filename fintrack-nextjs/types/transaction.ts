export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    date: string;
    type: TransactionType;
    category: string;
    description: string;
    amount_paisa: number; // Store as integer to avoid floating-point errors
}

export const EXPENSE_CATEGORIES = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Health',
    'Other'
] as const;

export const INCOME_SOURCES = [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Gift',
    'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeSource = typeof INCOME_SOURCES[number];
export type Category = ExpenseCategory | IncomeSource | 'Initial Balance';
