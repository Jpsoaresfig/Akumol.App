import { create } from 'zustand';

export interface TransactionModal {
  type: 'deposit' | 'withdraw' | null;
  isOpen: boolean;
}

interface AppState {
  sidebarOpen: boolean;
  transactionModal: TransactionModal;
  darkMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openTransactionModal: (type: 'deposit' | 'withdraw') => void;
  closeTransactionModal: () => void;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  transactionModal: { type: null, isOpen: false },
  darkMode: typeof window !== 'undefined' && document.documentElement.classList.contains('dark'),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openTransactionModal: (type) => set({ transactionModal: { type, isOpen: true } }),
  closeTransactionModal: () => set({ transactionModal: { type: null, isOpen: false } }),
  setDarkMode: (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    set({ darkMode: dark });
  },
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    document.documentElement.classList.toggle('dark', next);
    return { darkMode: next };
  }),
}));
