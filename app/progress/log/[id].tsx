import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatTile } from '@/components/StatTile';
import { StarRating } from '@/components/StarRating';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { useWorkoutStore } from '@/store/workoutStore';
import { formatDateTime, formatDuration } from '@/utils/date';
import { capitalise, totalCompletedSets, totalVolume } from '@/utils/workout';
import { formatWeight, roundWeight } from '@/utils/weight';
import { errorMessage } from '@/utils/validation';

export default function LogDetail() {
  const { colors } = useTheme();
  const unit = useUnit();
  const { id } = useLocalSearchParams<{ id: string }>();
  const log = useWorkoutStore((s) => s.logs.find((l) => l.id === id));
  const deleteLog = useWorkoutStore((s) => s.deleteLog);

  if (!log) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="alert-circle-outline" title="Workout not found" actionLabel="Go back" onAction={() => router.back()} />
      </Screen>
    );
  }

  const volume = totalVolume(log.exercise_logs, unit);

  const confirmDelete = () =>
    Alert.alert('Delete workout?', 'This removes it from your history and stats.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLog(log.id);
            router.back();
          } catch (e) {
            Alert.alert('Could not delete', errorMessage(e));
          }
        },
      },
    ]);

  return (
    <Screen edges={[]}>
      <AppText variant="h1">{log.template_name ?? 'Quick workout'}</AppText>
      <AppText tone="secondary" style={{ marginTop: 4, marginBottom: 16 }}>
        {formatDateTime(log.started_at)}
      </AppText>
      <View style={styles.tiles}>
        <StatTile label="Duration" value={formatDuration(log.duration_seconds)} />
        <StatTile label="Exercises" value={String(log.exercise_logs.length)} />
        <StatTile label="Sets" value={String(totalCompletedSets(log.exercise_logs))} />
      </View>
      {volume > 0 ? (
        <AppText variant="small" tone="secondary" style={{ marginTop: 10 }}>
          Total volume: {roundWeight(volume, 0).toLocaleString('en-GB')} {unit}
        </AppText>
      ) : null}

      {log.rating || log.notes ? (
        <Card style={{ marginTop: 16 }}>
          {log.rating ? <StarRating value={log.rating} size={22} /> : null}
          {log.notes ? (
            <AppText tone="secondary" style={{ marginTop: log.rating ? 10 : 0 }}>
              "{log.notes}"
            </AppText>
          ) : null}
        </Card>
      ) : null}

      <View style={[styles.chips, { marginTop: 12 }]}>
        {log.muscle_groups_hit.map((g) => (
          <Chip key={g} label={capitalise(g)} active />
        ))}
      </View>

      {log.exercise_logs.map((e) => (
        <Card key={e.id}>
          <AppText variant="h3">{e.name}</AppText>
          <AppText variant="caption" tone="muted" style={{ marginBottom: 8 }}>
            {capitalise(e.muscleGroup)}
          </AppText>
          {e.sets.map((s, i) => (
            <View key={i} style={[styles.setRow, { borderBottomColor: colors.border }]}>
              <AppText variant="small" tone="muted" style={{ width: 50 }}>
                Set {i + 1}
              </AppText>
              <AppText variant="small" weight="600" style={{ flex: 1 }}>
                {s.weight != null ? formatWeight(s.weight, s.unit) : 'Bodyweight'}
              </AppText>
              <AppText variant="small" weight="600">
                {s.reps ?? '—'} reps
              </AppText>
            </View>
          ))}
          {e.notes ? (
            <AppText variant="small" tone="secondary" style={{ marginTop: 8 }}>
              📝 {e.notes}
            </AppText>
          ) : null}
        </Card>
      ))}

      <Button title="Delete workout" variant="ghost" onPress={confirmDelete} style={{ marginTop: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
});
