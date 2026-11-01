import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatTile } from '@/components/StatTile';
import { StarRating } from '@/components/StarRating';
import { TextField } from '@/components/TextField';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatDuration } from '@/utils/date';
import { capitalise, muscleGroupsHit, totalCompletedSets, totalVolume } from '@/utils/workout';
import { roundWeight } from '@/utils/weight';
import { errorMessage } from '@/utils/validation';

export default function CompleteWorkout() {
  const { colors } = useTheme();
  const unit = useUnit();
  const finished = useActiveWorkoutStore((s) => s.finished);
  const clearFinished = useActiveWorkoutStore((s) => s.clearFinished);
  const userId = useAuthStore((s) => s.session?.user.id);
  const saveLog = useWorkoutStore((s) => s.saveLog);
  const templates = useWorkoutStore((s) => s.templates);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!finished) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="checkmark-done-outline" title="Nothing to save" actionLabel="Back to Home" onAction={() => router.replace(ROUTES.home)} />
      </Screen>
    );
  }

  const groups = muscleGroupsHit(finished.exercises);
  const sets = totalCompletedSets(finished.exercises);
  const volume = totalVolume(finished.exercises, unit);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await saveLog({
        user_id: userId,
        // The template may have been deleted mid-workout; keep the name, drop the link.
        template_id: templates.some((t) => t.id === finished.templateId) ? finished.templateId : null,
        template_name: finished.templateName,
        started_at: finished.startedAt,
        completed_at: finished.completedAt,
        duration_seconds: finished.durationSeconds,
        exercise_logs: finished.exercises,
        muscle_groups_hit: groups,
        rating,
        notes: notes.trim() || null,
      });
      clearFinished();
      router.replace(ROUTES.home);
    } catch (e) {
      Alert.alert('Could not save workout', `${errorMessage(e)}\n\nYour workout is kept on this device — please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const discard = () =>
    Alert.alert('Discard this workout?', 'It will not be saved to your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          clearFinished();
          router.replace(ROUTES.home);
        },
      },
    ]);

  return (
    <Screen edges={['bottom']}>
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <View style={[styles.trophy, { backgroundColor: colors.accent }]}>
          <Ionicons name="trophy" size={34} color={colors.onAccent} />
        </View>
        <AppText variant="h1" center style={{ marginTop: 12 }}>
          Workout complete!
        </AppText>
        <AppText tone="secondary" center style={{ marginTop: 4 }}>
          {finished.templateName}
        </AppText>
      </View>

      <View style={styles.tiles}>
        <StatTile label="Duration" value={formatDuration(finished.durationSeconds)} />
        <StatTile label="Exercises" value={String(finished.exercises.filter((e) => e.sets.length > 0).length)} />
        <StatTile label="Total sets" value={String(sets)} />
      </View>
      {volume > 0 ? (
        <AppText variant="small" tone="secondary" center style={{ marginTop: 10 }}>
          Total volume lifted: {roundWeight(volume, 0).toLocaleString('en-GB')} {unit}
        </AppText>
      ) : null}

      {finished.overload && finished.overload.compared > 0 ? (
        <Card style={{ marginTop: 16, borderColor: colors.accentText }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="trending-up" size={22} color={colors.accentText} />
            <AppText variant="h3" style={{ marginLeft: 8 }}>
              Progressive overload
            </AppText>
          </View>
          <AppText tone="secondary" style={{ marginTop: 6 }}>
            You beat last time ({formatDate(finished.overload.previousDate, { day: 'numeric', month: 'short' })}) on{' '}
            <AppText weight="700" tone="accent">
              {finished.overload.beaten} of {finished.overload.compared}
            </AppText>{' '}
            sets{finished.overload.matched ? ` and matched ${finished.overload.matched}` : ''}.
            {finished.overload.beaten > 0 ? ' Stronger than last time — nice work.' : ' Aim to add a rep or a little weight next time.'}
          </AppText>
        </Card>
      ) : null}

      <Card style={{ marginTop: 16 }}>
        <AppText variant="label" tone="muted" style={{ marginBottom: 10 }}>
          Muscle groups hit
        </AppText>
        <View style={styles.chips}>
          {groups.length ? groups.map((g) => <Chip key={g} label={capitalise(g)} active />) : <AppText tone="muted">—</AppText>}
        </View>
      </Card>

      <Card>
        <AppText variant="h3" center style={{ marginBottom: 12 }}>
          How was it?
        </AppText>
        <StarRating value={rating} onChange={setRating} />
        <TextField
          label="Notes (optional)"
          placeholder="Energy, sleep, PBs, anything worth remembering…"
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={1000}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </Card>

      <Button title="Save workout" onPress={save} loading={saving} />
      <Button title="Discard" variant="ghost" onPress={discard} style={{ marginTop: 6 }} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  trophy: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
