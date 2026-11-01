import { Platform } from 'react-native';

export const ACCENT = '#E8FF47';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  /** Accent used for text/icons on plain backgrounds (readable in both modes). */
  accentText: string;
  /** Text colour placed on top of an accent-filled surface. */
  onAccent: string;
  muted: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
  inputBackground: string;
}

export const darkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceAlt: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#6E6E6E',
  accent: ACCENT,
  accentText: ACCENT,
  onAccent: '#0A0A0A',
  muted: '#2E2E2E',
  danger: '#FF5A5F',
  success: '#4ADE80',
  warning: '#FBBF24',
  overlay: 'rgba(0,0,0,0.7)',
  inputBackground: '#1E1E1E',
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceAlt: '#EBEBEB',
  border: '#DADADA',
  text: '#0A0A0A',
  textSecondary: '#4A4A4A',
  textMuted: '#8A8A8A',
  accent: ACCENT,
  accentText: '#5F6E00',
  onAccent: '#0A0A0A',
  muted: '#D9D9D9',
  danger: '#D92D20',
  success: '#16A34A',
  warning: '#B45309',
  overlay: 'rgba(0,0,0,0.45)',
  inputBackground: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export const typography = {
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
};

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const buildTheme = (dark: boolean): Theme => ({
  dark,
  colors: dark ? darkColors : lightColors,
  spacing,
  radius,
  typography,
});
