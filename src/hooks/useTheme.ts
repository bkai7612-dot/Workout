import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, type Theme } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

export function useTheme(): Theme {
  const system = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const dark = mode === 'system' ? system !== 'light' : mode === 'dark';
  return useMemo(() => buildTheme(dark), [dark]);
}

/** Build a StyleSheet from the active theme, memoised per theme. */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
