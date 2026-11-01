import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({ options, value, onChange, size = 'md', style }: Props<T>) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }, style]}
      accessibilityRole="tablist"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[
              styles.item,
              size === 'sm' ? styles.sm : styles.md,
              { borderRadius: radius.sm, backgroundColor: selected ? colors.accent : 'transparent' },
            ]}
          >
            <AppText
              variant={size === 'sm' ? 'caption' : 'small'}
              weight="700"
              style={{ color: selected ? colors.onAccent : colors.textSecondary }}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 3 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  md: { paddingVertical: 9 },
  sm: { paddingVertical: 5, paddingHorizontal: 8 },
});
