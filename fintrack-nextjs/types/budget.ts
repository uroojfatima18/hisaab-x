export interface Budget {
    category: string;
    limit: number; // Monthly limit in paisa
    yearlyLimit?: number; // Yearly limit in paisa
}
