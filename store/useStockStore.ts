import { create } from 'zustand';

export interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  high: number;
  low: number;
  isGrowing: 'up' | 'down' | null;
}

interface User {
  id: number;
  username: string;
}

interface StockState {
  user: User | null;
  activeTab: 'dashboard' | 'watchlist' | 'recommendations';
  watchlist: string[];
  prices: Record<string, PriceData>;
  selectedSymbol: string | null;
  setUser: (user: User | null) => void;
  setActiveTab: (tab: 'dashboard' | 'watchlist' | 'recommendations') => void;
  setWatchlist: (symbols: string[]) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  initializePrice: (symbol: string, currentPrice: number, prevClose: number, high: number, low: number) => void;
  updateLivePrice: (symbol: string, newPrice: number) => void;
  clearFlash: (symbol: string) => void;
  resetAll: () => void;
}

export const useStockStore = create<StockState>((set) => ({
  user: null,
  activeTab: 'dashboard',
  watchlist: [],
  prices: {},
  selectedSymbol: null,
  setUser: (user) => set({ user }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setWatchlist: (symbols) => set({ watchlist: symbols }),
  addSymbol: (symbol) => set((state) => ({
    watchlist: state.watchlist.includes(symbol) ? state.watchlist : [...state.watchlist, symbol]
  })),
  removeSymbol: (symbol) => set((state) => ({
    watchlist: state.watchlist.filter((s) => s !== symbol)
  })),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  resetAll: () => set({ user: null, activeTab: 'dashboard', watchlist: [], prices: {}, selectedSymbol: null }),
  clearFlash: (symbol) => set((state) => {
    const existing = state.prices[symbol];
    if (!existing) return {};
    return {
      prices: {
        ...state.prices,
        [symbol]: {
          ...existing,
          isGrowing: null,
        }
      }
    };
  }),
  initializePrice: (symbol, currentPrice, prevClose, high, low) => set((state) => {
    const change = currentPrice - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    return {
      prices: {
        ...state.prices,
        [symbol]: {
          price: currentPrice,
          change,
          changePercent,
          prevClose,
          high,
          low,
          isGrowing: null,
        }
      }
    };
  }),
  updateLivePrice: (symbol, newPrice) => set((state) => {
    const existing = state.prices[symbol];
    if (!existing) return {}; // not initialized yet

    const prevPrice = existing.price;
    if (prevPrice === newPrice) return {}; // no change

    const isGrowing = newPrice > prevPrice ? 'up' : 'down';
    const change = newPrice - existing.prevClose;
    const changePercent = existing.prevClose !== 0 ? (change / existing.prevClose) * 100 : 0;

    const nextHigh = newPrice > existing.high ? newPrice : existing.high;
    const nextLow = existing.low === 0 || newPrice < existing.low ? newPrice : existing.low;

    return {
      prices: {
        ...state.prices,
        [symbol]: {
          ...existing,
          price: newPrice,
          change,
          changePercent,
          high: nextHigh,
          low: nextLow,
          isGrowing,
        }
      }
    };
  }),
}));
