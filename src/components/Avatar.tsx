import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel="Profile photo placeholder"
    >
      <AppText style={{ color: colors.onAccent, fontSize: size * 0.42, fontWeight: '800' }}>
        {(name?.[0] ?? '?').toUpperCase()}
      </AppText>
    </View>
  );
}
