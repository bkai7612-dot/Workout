import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

interface Props {
  label: string;
  value: string;
  sub?: React.ReactNode;
}

export function StatTile({ label, value, sub }: Props) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="h3" style={{ marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      {sub}
    </View>
  );
}

const styles = StyleSheet.create({ tile: { flex: 1, padding: 12, minWidth: 0 } });
