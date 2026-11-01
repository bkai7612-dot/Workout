import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
}

export function Checkbox({ checked, onChange, children, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel}
        onPress={() => onChange(!checked)}
        hitSlop={10}
        style={[
          styles.box,
          { borderColor: checked ? colors.accent : colors.textMuted, backgroundColor: checked ? colors.accent : 'transparent' },
        ]}
      >
        {checked ? <Ionicons name="checkmark" size={16} color={colors.onAccent} /> : null}
      </Pressable>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
