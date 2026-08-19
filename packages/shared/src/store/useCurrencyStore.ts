import { create } from 'zustand';

export type CurrencyCode = 'USD' | 'ETB' | 'EUR' | 'GBP';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateToUSD: number; // 1 USD = rate
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', rateToUSD: 1.0 },
  { code: 'ETB', symbol: 'Br ', label: 'ETB (Birr)', rateToUSD: 125.0 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rateToUSD: 0.92 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rateToUSD: 0.78 },
];

interface CurrencyState {
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currentCurrency: 'USD',
  setCurrency: (code) => set({ currentCurrency: code }),
  convertPrice: (amountInUSD) => {
    const curr = CURRENCIES.find((c) => c.code === get().currentCurrency) || CURRENCIES[0];
    return Math.round(amountInUSD * curr.rateToUSD);
  },
  formatPrice: (amountInUSD) => {
    const curr = CURRENCIES.find((c) => c.code === get().currentCurrency) || CURRENCIES[0];
    const converted = Math.round(amountInUSD * curr.rateToUSD);
    return `${curr.symbol}${converted.toLocaleString()}`;
  },
}));
