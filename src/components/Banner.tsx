import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

interface Props {
  message: string;
  tone?: 'info' | 'warning' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Banner({ message, tone = 'info', icon }: Props) {
  const { colors, radius } = useTheme();
  const color = tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.textSecondary;
  return (
    <View
      style={[styles.wrap, { borderRadius: radius.md, borderColor: color, backgroundColor: colors.surfaceAlt }]}
      accessibilityRole="alert"
    >
      <Ionicons
        name={icon ?? (tone === 'info' ? 'information-circle-outline' : 'warning-outline')}
        size={18}
        color={color}
        style={{ marginRight: 8, marginTop: 1 }}
      />
      <AppText variant="caption" style={{ flex: 1, color: colors.textSecondary, lineHeight: 17 }}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flexDirection: 'row', padding: 12, borderWidth: 1, marginBottom: 12 } });
