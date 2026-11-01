import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export function LogoMark({ size = 72 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityLabel="ProjectBuilt logo">
      <Rect x={0} y={0} width={72} height={72} rx={18} fill={colors.accent} />
      {/* Stylised "PB" built from stacked blocks */}
      <Path d="M18 16h16a10 10 0 0 1 0 20h-8v20h-8z M26 24v4h8a2 2 0 0 0 0-4z" fill="#0A0A0A" fillRule="evenodd" />
      <Path d="M40 40h10a8 8 0 0 1 0 16H40z M46 46v4h4a2 2 0 0 0 0-4z" fill="#0A0A0A" fillRule="evenodd" />
    </Svg>
  );
}

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <View style={styles.wrap}>
      <LogoMark size={size} />
      <AppText variant="hero" style={{ marginTop: 16 }}>
        Project<AppText variant="hero" tone="accent">Built</AppText>
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center' } });
