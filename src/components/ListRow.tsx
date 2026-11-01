import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

interface Props {
  label: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}

export function ListRow({ label, value, icon, onPress, danger, right }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      {icon ? (
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.textSecondary} style={styles.icon} />
      ) : null}
      <AppText variant="body" style={{ flex: 1, color: danger ? colors.danger : colors.text }}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="small" tone="muted" style={{ marginRight: 6 }}>
          {value}
        </AppText>
      ) : null}
      {right}
      {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  icon: { marginRight: 12 },
});

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 8 }} />;
}
