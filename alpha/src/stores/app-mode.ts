import { create } from 'zustand';

type AppMode = 'main' | 'finance';

interface AppModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

export const useAppMode = create<AppModeState>((set) => ({
  mode: 'main',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'main' ? 'finance' : 'main' }))
}));
