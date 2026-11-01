import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { typography } from '@/constants/theme';

type Variant = keyof typeof typography;
type Tone = 'default' | 'secondary' | 'muted' | 'accent' | 'danger' | 'success' | 'onAccent';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
  weight?: TextStyle['fontWeight'];
}

export function AppText({ variant = 'body', tone = 'default', center, weight, style, ...rest }: Props) {
  const theme = useTheme();
  const c = theme.colors;
  const color = {
    default: c.text,
    secondary: c.textSecondary,
    muted: c.textMuted,
    accent: c.accentText,
    danger: c.danger,
    success: c.success,
    onAccent: c.onAccent,
  }[tone];
  return (
    <Text
      style={[
        theme.typography[variant],
        { color },
        center && { textAlign: 'center' },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...rest}
    />
  );
}
