import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MUSCLE_GROUPS, type MuscleGroup, type TemplateExercise, type WeightUnit } from '@/types';
import { uid } from '@/utils/id';
import { capitalise, estimateTemplateMinutes, muscleGroupsFromExercises } from '@/utils/workout';
import { EXERCISES } from '@/data/exercises';
import { Chip } from './Chip';
import { ToggleRow } from './ToggleRow';
import { parseNumber } from '@/utils/weight';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { ExercisePicker } from './ExercisePicker';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';
import { TextField } from './TextField';
import { SectionHeader } from './SectionHeader';
import type { TemplateInput } from '@/store/workoutStore';

interface Props {
  initial?: TemplateInput;
  defaultUnit: WeightUnit;
  saving: boolean;
  submitLabel: string;
  onSubmit: (input: TemplateInput) => void;
}

const MUSCLE_OPTIONS = MUSCLE_GROUPS.map((g) => ({ value: g, label: capitalise(g) }));

function ExerciseEditor({
  ex,
  index,
  count,
  onChange,
  onRemove,
  onMove,
}: {
  ex: TemplateExercise;
  index: number;
  count: number;
  onChange: (patch: Partial<TemplateExercise>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { colors } = useTheme();
  const [weightText, setWeightText] = useState(ex.weight != null ? String(ex.weight) : '');
  return (
    <Card>
      <View style={styles.exHeader}>
        <AppText variant="label" tone="muted" style={{ flex: 1 }}>
          Exercise {index + 1}
        </AppText>
        <Pressable disabled={index === 0} onPress={() => onMove(-1)} hitSlop={8} accessibilityLabel="Move up" style={styles.iconBtn}>
          <Ionicons name="arrow-up" size={18} color={index === 0 ? colors.muted : colors.textSecondary} />
        </Pressable>
        <Pressable disabled={index === count - 1} onPress={() => onMove(1)} hitSlop={8} accessibilityLabel="Move down" style={styles.iconBtn}>
          <Ionicons name="arrow-down" size={18} color={index === count - 1 ? colors.muted : colors.textSecondary} />
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Remove exercise" style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
      <TextField label="Exercise name" value={ex.name} onChangeText={(name) => onChange({ name, libraryId: undefined })} />
      <Select<MuscleGroup>
        label="Muscle group"
        value={ex.muscleGroup}
        options={MUSCLE_OPTIONS}
        onChange={(muscleGroup) => onChange({ muscleGroup })}
      />
      <View style={styles.row}>
        <View style={styles.col}>
          <TextField
            label="Sets"
            keyboardType="number-pad"
            value={ex.sets ? String(ex.sets) : ''}
            onChangeText={(t) => onChange({ sets: Math.min(20, parseInt(t.replace(/\D/g, '') || '0', 10)) })}
          />
        </View>
        <View style={[styles.col, { flex: 1.4 }]}>
          <TextField label="Reps" placeholder="8–12 or To failure" value={ex.reps} onChangeText={(reps) => onChange({ reps })} />
        </View>
        <View style={styles.col}>
          <TextField
            label="Rest (s)"
            keyboardType="number-pad"
            value={String(ex.restSeconds)}
            onChangeText={(t) => onChange({ restSeconds: Math.min(900, parseInt(t.replace(/\D/g, '') || '0', 10)) })}
          />
        </View>
      </View>
      <View style={[styles.row, { alignItems: 'flex-end' }]}>
        <View style={[styles.col, { flex: 1.2 }]}>
          <TextField
            label="Weight (optional)"
            keyboardType="decimal-pad"
            value={weightText}
            onChangeText={(t) => {
              setWeightText(t);
              onChange({ weight: parseNumber(t) });
            }}
          />
        </View>
        <View style={[styles.col, { marginBottom: 14 }]}>
          <SegmentedControl<WeightUnit>
            size="sm"
            value={ex.unit}
            onChange={(unit) => onChange({ unit })}
            options={[
              { value: 'kg', label: 'kg' },
              { value: 'lbs', label: 'lbs' },
            ]}
          />
        </View>
      </View>
      <TextField
        label="Notes (optional)"
        placeholder="Tempo, cues, setup…"
        value={ex.notes ?? ''}
        onChangeText={(notes) => onChange({ notes })}
        multiline
      />
    </Card>
  );
}

export function TemplateEditor({ initial, defaultUnit, saving, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [exercises, setExercises] = useState<TemplateExercise[]>(initial?.exercises ?? []);
  const [muscles, setMuscles] = useState<MuscleGroup[]>(() =>
    muscleGroupsFromExercises(initial?.exercises ?? []),
  );
  const [overload, setOverload] = useState(initial?.progressiveOverload ?? true);

  // A few library suggestions for the chosen muscles that aren't in the template yet.
  const suggestions = useMemo(() => {
    const inTemplate = new Set(exercises.map((e) => e.libraryId).filter(Boolean));
    return muscles.flatMap((m) =>
      EXERCISES.filter((e) => e.primary === m && !inTemplate.has(e.id)).slice(0, muscles.length > 2 ? 2 : 3),
    );
  }, [muscles, exercises]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const minutes = useMemo(() => estimateTemplateMinutes(exercises), [exercises]);

  const add = (name: string, muscleGroup: MuscleGroup, libraryId?: string) =>
    setExercises((list) => [
      ...list,
      { id: uid(), name, libraryId, muscleGroup, sets: 3, reps: '8–12', weight: null, unit: defaultUnit, restSeconds: 90, notes: '' },
    ]);

  const update = (id: string, patch: Partial<TemplateExercise>) =>
    setExercises((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const move = (index: number, dir: -1 | 1) =>
    setExercises((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const submit = () => {
    if (!name.trim()) {
      setNameError('Give your template a name.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Add an exercise', 'A template needs at least one exercise.');
      return;
    }
    const unnamed = exercises.find((e) => !e.name.trim());
    if (unnamed) {
      Alert.alert('Missing name', 'Every exercise needs a name.');
      return;
    }
    if (exercises.some((e) => e.sets < 1)) {
      Alert.alert('Check your sets', 'Every exercise needs at least 1 set.');
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim() || null, exercises, progressiveOverload: overload });
  };

  return (
    <View>
      <TextField
        label="Template name"
        placeholder="e.g. Push Day A"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setNameError(null);
        }}
        error={nameError}
        maxLength={60}
      />
      <TextField
        label="Description (optional)"
        placeholder="What's this session about?"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={280}
      />
      <SectionHeader title="Muscle groups" />
      <AppText variant="small" tone="secondary" style={{ marginBottom: 10 }}>
        Choose the muscles this template trains. We'll suggest exercises and show them first in the library.
      </AppText>
      <View style={styles.chips}>
        {MUSCLE_GROUPS.map((g) => (
          <Chip
            key={g}
            label={capitalise(g)}
            active={muscles.includes(g)}
            onPress={() => setMuscles((list) => (list.includes(g) ? list.filter((x) => x !== g) : [...list, g]))}
          />
        ))}
      </View>
      {suggestions.length ? (
        <>
          <AppText variant="caption" tone="muted" style={{ marginTop: 6, marginBottom: 8 }}>
            Suggested — tap to add
          </AppText>
          <View style={styles.chips}>
            {suggestions.map((s) => (
              <Chip key={s.id} label={`+ ${s.name}`} onPress={() => add(s.name, s.primary, s.id)} />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title={`Exercises · est. ${minutes} min`} />
      {exercises.map((ex, i) => (
        <ExerciseEditor
          key={ex.id}
          ex={ex}
          index={i}
          count={exercises.length}
          onChange={(patch) => update(ex.id, patch)}
          onRemove={() => setExercises((list) => list.filter((e) => e.id !== ex.id))}
          onMove={(dir) => move(i, dir)}
        />
      ))}
      <Button title="Add exercise" icon="add" variant="secondary" onPress={() => setPickerOpen(true)} />
      <AppText variant="caption" tone="muted" center style={{ marginTop: 8 }}>
        Estimated duration is calculated from sets × (rest time + ~40s per set).
      </AppText>
      <View style={{ marginTop: 16 }}>
        <ToggleRow
          label="Progressive overload"
          description="When you start this template, see what you lifted last time next to every set — and whether you beat it."
          value={overload}
          onChange={setOverload}
        />
      </View>
      <Button title={submitLabel} onPress={submit} loading={saving} style={{ marginTop: 24 }} />
      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectLibrary={(e) => add(e.name, e.primary, e.id)}
        onAddCustom={(n) => add(n, muscles[0] ?? 'full body')}
        focusGroups={muscles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  exHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBtn: { padding: 6, marginLeft: 4 },
  row: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  col: { flex: 1 },
});
