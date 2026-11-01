import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

interface Props {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

/** Large selectable row used in the questionnaire and PAR-Q. */
export function OptionButton({ label, description, selected, onPress }: Props) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.row,
        {
          borderRadius: radius.md,
          backgroundColor: selected ? colors.accent : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="bodyBold" style={{ color: selected ? colors.onAccent : colors.text }}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" style={{ color: selected ? colors.onAccent : colors.textMuted, marginTop: 2 }}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? colors.onAccent : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, marginBottom: 10 },
});
