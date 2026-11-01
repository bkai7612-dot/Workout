import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppModal } from './AppModal';
import { AppText } from './AppText';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label?: string;
  value: T | null;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
}

/** Dropdown-style picker rendered as a bottom sheet. */
export function Select<T extends string>({ label, value, options, onChange, placeholder = 'Select…' }: Props<T>) {
  const { colors, radius } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      {label ? (
        <AppText variant="caption" tone="secondary" style={{ marginBottom: 6 }}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Select'}: ${current?.label ?? placeholder}`}
        style={[styles.field, { borderColor: colors.border, backgroundColor: colors.inputBackground, borderRadius: radius.md }]}
      >
        <AppText variant="body" style={{ flex: 1, color: current ? colors.text : colors.textMuted }}>
          {current?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      <AppModal visible={open} onClose={() => setOpen(false)} title={label ?? 'Select'}>
        <FlatList
          data={options}
          keyExtractor={(o) => o.value}
          renderItem={({ item }) => {
            const selected = item.value === value;
            return (
              <Pressable
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={[styles.option, { borderBottomColor: colors.border }]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <AppText variant="body" style={{ flex: 1 }} weight={selected ? '700' : '400'}>
                  {item.label}
                </AppText>
                {selected ? <Ionicons name="checkmark" size={20} color={colors.accentText} /> : null}
              </Pressable>
            );
          }}
        />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, minHeight: 50, paddingHorizontal: 14, marginBottom: 14 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
