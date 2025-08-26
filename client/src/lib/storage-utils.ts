// Utility functions for working with local storage in demo mode
// In production, this would be handled by the backend API

const STORAGE_KEY = 'sewavault_demo_tokens';

export interface LocalTokenData {
  tokenNumber: number;
  isInUse: boolean;
  depositData?: {
    sangatPhoto: string;
    items: Array<{ name: string; quantity: number }>;
    others?: string;
    timestamp: number;
  };
}

export function getStoredTokens(): Record<string, LocalTokenData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse stored tokens:', error);
    return {};
  }
}

export function storeToken(tokenData: LocalTokenData): void {
  try {
    const stored = getStoredTokens();
    stored[tokenData.tokenNumber.toString()] = tokenData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

export function removeToken(tokenNumber: number): void {
  try {
    const stored = getStoredTokens();
    delete stored[tokenNumber.toString()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

export function getTokenStats() {
  const stored = getStoredTokens();
  const inUse = Object.values(stored).filter(token => token.isInUse).length;
  const available = 20 - inUse; // Total of 20 tokens (1001-1020)
  
  return { inUse, available };
}

export function clearAllTokens(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}
