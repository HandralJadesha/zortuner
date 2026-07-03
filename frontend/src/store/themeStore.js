import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'light', // default
  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('layerly_theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        set({ theme: storedTheme });
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        set({ theme: 'dark' });
      }
    }
  },
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('layerly_theme', newTheme);
    }
    return { theme: newTheme };
  }),
}));
