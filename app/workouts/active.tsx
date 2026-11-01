import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Banner } from '@/components/Banner';
import { RestTimer } from '@/components/RestTimer';
import { ExercisePicker } from '@/components/ExercisePicker';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useProfileStore } from '@/store/profileStore';
import { ROUTES } from '@/constants/routes';
import { PARQ_REFER_MESSAGE } from '@/data/parq';
import type { ExerciseLog, SetLog } from '@/types';
import { formatClock } from '@/utils/date';
import { capitalise } from '@/utils/workout';
import { parseNumber } from '@/utils/weight';

function ElapsedClock({ startedAt }: { startedAt: string | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secs = startedAt ? (now - new Date(startedAt).getTime()) / 1000 : 0;
  return (
    <AppText variant="bodyBold" tone="accent" accessibilityLabel="Elapsed time">
      {formatClock(secs)}
    </AppText>
  );
}

function SetRow({ exercise, set, index }: { exercise: ExerciseLog; set: SetLog; index: number }) {
  const { colors, radius } = useTheme();
  const updateSet = useActiveWorkoutStore((s) => s.updateSet);
  const toggle = useActiveWorkoutStore((s) => s.toggleSetComplete);
  const removeSet = useActiveWorkoutStore((s) => s.removeSet);
  const [weight, setWeight] = useState(set.weight != null ? String(set.weight) : '');
  const [reps, setReps] = useState(set.reps != null ? String(set.reps) : '');

  const inputStyle = [
    styles.input,
    { backgroundColor: set.completed ? 'transparent' : colors.inputBackground, borderColor: colors.border, color: colors.text, borderRadius: radius.sm },
  ];

  return (
    <View style={[styles.setRow, set.completed && { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm }]}>
      <Pressable
        onLongPress={() =>
          exercise.sets.length > 1 &&
          Alert.alert('Remove set?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeSet(exercise.id, index) },
          ])
        }
        style={styles.setNum}
        accessibilityLabel={`Set ${index + 1}. Long press to remove`}
      >
        <AppText variant="bodyBold" tone="muted">{index + 1}</AppText>
      </Pressable>
      <TextInput
        style={inputStyle}
        value={weight}
        onChangeText={(t) => {
          setWeight(t);
          updateSet(exercise.id, index, { weight: parseNumber(t) });
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={`Set ${index + 1} weight`}
      />
      <Pressable
        onPress={() => updateSet(exercise.id, index, { unit: set.unit === 'kg' ? 'lbs' : 'kg' })}
        style={[styles.unit, { borderColor: colors.border, borderRadius: radius.sm }]}
        accessibilityLabel={`Unit ${set.unit}, tap to switch`}
      >
        <AppText variant="caption" weight="700">{set.unit}</AppText>
      </Pressable>
      <TextInput
        style={inputStyle}
        value={reps}
        onChangeText={(t) => {
          const clean = t.replace(/\D/g, '');
          setReps(clean);
          updateSet(exercise.id, index, { reps: clean ? parseInt(clean, 10) : null });
        }}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={`Set ${index + 1} reps`}
      />
      <Pressable
        onPress={() => toggle(exercise.id, index)}
        style={[styles.check, { backgroundColor: set.completed ? colors.accent : colors.surfaceAlt, borderRadius: radius.sm }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.completed }}
        accessibilityLabel={`Complete set ${index + 1}`}
      >
        <Ionicons name="checkmark" size={20} color={set.completed ? colors.onAccent : colors.textMuted} />
      </Pressable>
    </View>
  );
}

function ExerciseCard({ exercise }: { exercise: ExerciseLog }) {
  const { colors } = useTheme();
  const addSet = useActiveWorkoutStore((s) => s.addSet);
  const setNotes = useActiveWorkoutStore((s) => s.setNotes);
  const removeExercise = useActiveWorkoutStore((s) => s.removeExercise);
  const [showNotes, setShowNotes] = useState(!!exercise.notes);
  const done = exercise.sets.filter((s) => s.completed).length;

  return (
    <Card>
      <View style={styles.exHeader}>
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{exercise.name}</AppText>
          <AppText variant="caption" tone="muted">
            {capitalise(exercise.muscleGroup)}
            {exercise.targetReps ? ` · Target ${exercise.targetReps} reps` : ''} · Rest {exercise.restSeconds}s · {done}/{exercise.sets.length} done
          </AppText>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert('Remove exercise?', exercise.name, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeExercise(exercise.id) },
            ])
          }
          hitSlop={10}
          accessibilityLabel={`Remove ${exercise.name}`}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.setHeader}>
        <AppText variant="caption" tone="muted" style={styles.setNum}>SET</AppText>
        <AppText variant="caption" tone="muted" style={{ flex: 1, textAlign: 'center' }}>WEIGHT</AppText>
        <View style={{ width: 44 }} />
        <AppText variant="caption" tone="muted" style={{ flex: 1, textAlign: 'center' }}>REPS</AppText>
        <View style={{ width: 44 }} />
      </View>
      {exercise.sets.map((s, i) => (
        <SetRow key={`${exercise.id}-${i}-${exercise.sets.length}`} exercise={exercise} set={s} index={i} />
      ))}
      <View style={styles.exFooter}>
        <Button title="Add set" icon="add" size="sm" variant="secondary" onPress={() => addSet(exercise.id)} style={{ flex: 1 }} />
        <Button
          title={showNotes ? 'Hide notes' : 'Notes'}
          icon="create-outline"
          size="sm"
          variant="ghost"
          onPress={() => setShowNotes((v) => !v)}
          style={{ flex: 1 }}
        />
      </View>
      {showNotes ? (
        <TextInput
          value={exercise.notes}
          onChangeText={(t) => setNotes(exercise.id, t)}
          placeholder="How did it feel? Form cues, adjustments…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.notes, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
          accessibilityLabel={`${exercise.name} notes`}
        />
      ) : null}
    </Card>
  );
}

export default function ActiveWorkout() {
  const { colors } = useTheme();
  const unit = useUnit();
  const state = useActiveWorkoutStore();
  const parqCleared = useProfileStore((s) => s.profile?.parq_cleared ?? true);
  const [picker, setPicker] = useState(false);

  if (!state.active) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="barbell-outline" title="No active workout" message="Start one from the Workouts tab." actionLabel="Go to Workouts" onAction={() => router.replace(ROUTES.workouts)} />
      </Screen>
    );
  }

  const completedSets = state.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);

  const finish = () => {
    if (completedSets === 0) {
      Alert.alert('No sets completed', 'Tick off at least one set before finishing, or discard this workout.');
      return;
    }
    const incomplete = state.exercises.reduce((a, e) => a + e.sets.filter((s) => !s.completed).length, 0);
    const go = () => {
      state.finish();
      router.replace(ROUTES.completeWorkout);
    };
    if (incomplete > 0) {
      Alert.alert('Finish workout?', `${incomplete} set${incomplete === 1 ? ' is' : 's are'} not ticked off and won't be saved.`, [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Finish', onPress: go },
      ]);
    } else go();
  };

  const discard = () =>
    Alert.alert('Discard workout?', 'Nothing from this session will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          state.discard();
          router.back();
        },
      },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: state.templateName,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Minimise workout">
              <Ionicons name="chevron-down" size={26} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => <ElapsedClock startedAt={state.startedAt} />,
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Screen edges={[]} contentStyle={{ paddingBottom: 140 }}>
          {!parqCleared ? <Banner tone="warning" message={PARQ_REFER_MESSAGE} /> : null}
          {state.exercises.length === 0 ? (
            <Card>
              <EmptyState icon="add-circle-outline" title="Empty workout" message="Add exercises from the library or create your own." />
            </Card>
          ) : (
            state.exercises.map((e) => <ExerciseCard key={e.id} exercise={e} />)
          )}
          <Button title="Add exercise" icon="add" variant="outline" onPress={() => setPicker(true)} />
          <Button title="Finish workout" icon="flag-outline" onPress={finish} style={{ marginTop: 12 }} />
          <Button title="Discard workout" variant="ghost" onPress={discard} style={{ marginTop: 4 }} />
        </Screen>
        <RestTimer />
      </View>
      <ExercisePicker
        visible={picker}
        onClose={() => setPicker(false)}
        onSelectLibrary={(e) => state.addExercise({ name: e.name, muscleGroup: e.primary, unit })}
        onAddCustom={(name) => state.addExercise({ name, muscleGroup: 'full body', unit })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  exHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  setHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  setNum: { width: 32, alignItems: 'center', textAlign: 'center' },
  input: { flex: 1, height: 40, borderWidth: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  unit: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  check: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  exFooter: { flexDirection: 'row', gap: 8, marginTop: 10 },
  notes: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 60, marginTop: 10, fontSize: 14 },
});
