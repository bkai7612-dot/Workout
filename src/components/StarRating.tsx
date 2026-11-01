import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: number | null;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 36 }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={`Rating ${value ?? 0} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (value ?? 0) >= n;
        return (
          <Pressable
            key={n}
            disabled={!onChange}
            onPress={() => onChange?.(n)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? colors.accentText : colors.textMuted}
              style={{ marginHorizontal: size > 20 ? 4 : 1 }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'center' } });
