import {create} from "zustand";

const Store = create((set) => ({
  transactions: [],
  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
    })),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));

export default Store;