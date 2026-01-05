// Frontend API helper for making requests to the FastAPI backend
// Note: This implementation assumes the FastAPI backend is running on a different port
// For example, FastAPI on port 8000 and Next.js on port 3000

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Store the JWT token in memory for this session
let authToken: string | null = null;

export interface User {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  settings: UserSettings | null
}

export interface UserSettings {
  id: string
  userId: string
  currency: string
  symbol: string
  setupComplete: boolean
  initialBalance: number
}

export interface Transaction {
  id: string
  userId: string
  date: string
  type: 'income' | 'expense'
  category: string
  description: string
  amountPaisa: number
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  limit: number
  yearlyLimit: number | null
}

// API Error handler
class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status)
  }
  return data
}

// Function to add auth token to headers
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ============ AUTH API ============

export async function signup(username: string, email: string, password: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const result = await response.json();

  if (!response.ok) {
    throw new ApiError(result.error || 'Request failed', response.status);
  }

  // Extract and store the token if it's returned in the response
  if (result.access_token) {
    authToken = result.access_token;
  }

  return { user: result.user };
}

export async function login(username: string, password: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await response.json();

  if (!response.ok) {
    throw new ApiError(result.error || 'Request failed', response.status);
  }

  // Extract and store the token if it's returned in the response
  if (result.access_token) {
    authToken = result.access_token;
  }

  return { user: result.user };
}

export async function logout(): Promise<{ success: boolean }> {
  // Clear the stored token
  authToken = null;

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getCurrentUser(): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// ============ USER API ============

export async function updateUser(data: { avatarUrl?: string; email?: string }): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteUser(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// ============ SETTINGS API ============

export async function getSettings(): Promise<{ settings: UserSettings }> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function updateSettings(data: {
  currency?: string
  symbol?: string
  setupComplete?: boolean
  initialBalance?: number
}): Promise<{ settings: UserSettings }> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

// ============ TRANSACTIONS API ============

export async function getTransactions(): Promise<{ transactions: Transaction[] }> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function createTransaction(data: {
  date: string
  type: 'income' | 'expense'
  category: string
  description: string
  amountPaisa: number
}): Promise<{ transaction: Transaction }> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateTransaction(
  id: string,
  data: Partial<{
    date: string
    type: 'income' | 'expense'
    category: string
    description: string
    amountPaisa: number
  }>
): Promise<{ transaction: Transaction }> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteTransaction(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function deleteAllTransactions(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// ============ BUDGETS API ============

export async function getBudgets(): Promise<{ budgets: Budget[] }> {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function saveBudget(data: {
  category: string
  limit: number
  yearlyLimit?: number
}): Promise<{ budget: Budget }> {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function deleteBudget(category: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/budgets/${encodeURIComponent(category)}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function deleteAllBudgets(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}
