import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { ThemeMode } from '@/types';

const KEY = 'pb_theme_mode';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
}

/**
 * Local copy of the theme preference so the correct theme is shown before the
 * profile has loaded (and on the auth screens). The source of truth for a
 * signed-in user is `profiles.dark_mode`, which is synced into this store.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  hydrated: false,
  hydrate: async () => {
    try {
      const v = (await SecureStore.getItemAsync(KEY)) as ThemeMode | null;
      if (v === 'dark' || v === 'light' || v === 'system') set({ mode: v });
    } finally {
      set({ hydrated: true });
    }
  },
  setMode: (mode) => {
    set({ mode });
    SecureStore.setItemAsync(KEY, mode).catch(() => {});
  },
}));
