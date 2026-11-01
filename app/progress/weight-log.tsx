import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SectionHeader } from '@/components/SectionHeader';
import { Chip } from '@/components/Chip';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { useAuthStore } from '@/store/authStore';
import { useWeightStore } from '@/store/weightStore';
import type { WeightUnit } from '@/types';
import { daysAgo, formatDate, WEEKDAY_SHORT } from '@/utils/date';
import { formatAs, formatWeight, parseNumber } from '@/utils/weight';
import { errorMessage } from '@/utils/validation';

export default function WeightLogScreen() {
  const { colors } = useTheme();
  const defaultUnit = useUnit();
  const userId = useAuthStore((s) => s.session?.user.id);
  const entries = useWeightStore((s) => s.entries);
  const addEntry = useWeightStore((s) => s.addEntry);
  const deleteEntry = useWeightStore((s) => s.deleteEntry);
  const [unit, setUnit] = useState<WeightUnit>(defaultUnit);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [dayOffset, setDayOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const n = parseNumber(value);
    const [min, max] = unit === 'kg' ? [20, 350] : [45, 770];
    if (n == null || n < min || n > max) return setError(`Enter a weight between ${min} and ${max} ${unit}.`);
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const date = dayOffset === 0 ? new Date() : (() => {
        const d = daysAgo(dayOffset);
        d.setHours(9, 0, 0, 0);
        return d;
      })();
      await addEntry({ userId, weight: n, unit, loggedAt: date, notes });
      router.back();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) =>
    Alert.alert('Delete entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id).catch((e) => Alert.alert('Error', errorMessage(e))) },
    ]);

  const recent = [...entries].reverse().slice(0, 30);

  return (
    <Screen edges={[]}>
      <SegmentedControl<WeightUnit>
        value={unit}
        onChange={setUnit}
        options={[
          { value: 'kg', label: 'kg' },
          { value: 'lbs', label: 'lbs' },
        ]}
        style={{ marginBottom: 16 }}
      />
      <TextField
        label={`Body weight (${unit})`}
        value={value}
        onChangeText={(t) => {
          setValue(t);
          setError(null);
        }}
        keyboardType="decimal-pad"
        placeholder={unit === 'kg' ? 'e.g. 78.4' : 'e.g. 172.8'}
        error={error}
        style={{ fontSize: 24, fontWeight: '700' }}
      />
      <AppText variant="caption" tone="secondary" style={{ marginBottom: 6 }}>
        Date
      </AppText>
      <View style={styles.chips}>
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <Chip
            key={d}
            label={d === 0 ? 'Today' : d === 1 ? 'Yesterday' : WEEKDAY_SHORT[daysAgo(d).getDay()]}
            active={dayOffset === d}
            onPress={() => setDayOffset(d)}
          />
        ))}
      </View>
      <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="e.g. morning, after a big weekend" maxLength={200} />
      <Button title="Save weight" onPress={save} loading={saving} />
      <AppText variant="caption" tone="muted" center style={{ marginTop: 8 }}>
        Tip: weigh yourself first thing in the morning, after the loo, for the most consistent readings.
      </AppText>

      {recent.length ? (
        <>
          <SectionHeader title="Recent entries" />
          <Card style={{ paddingVertical: 4 }}>
            {recent.map((e) => (
              <View key={e.id} style={[styles.entry, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyBold">
                    {formatWeight(e.weight, e.unit)}
                    {e.unit !== defaultUnit ? (
                      <AppText variant="small" tone="muted"> ({formatAs(e.weight, e.unit, defaultUnit)})</AppText>
                    ) : null}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {formatDate(e.logged_at, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    {e.notes ? ` · ${e.notes}` : ''}
                  </AppText>
                </View>
                <Pressable onPress={() => confirmDelete(e.id)} hitSlop={10} accessibilityLabel="Delete entry">
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  entry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
