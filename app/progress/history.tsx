import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { WorkoutLogRow } from '@/components/WorkoutLogRow';
import { EmptyState } from '@/components/EmptyState';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { useWorkoutStore } from '@/store/workoutStore';
import { ROUTES } from '@/constants/routes';
import type { WorkoutLog } from '@/types';
import { formatDate } from '@/utils/date';

type Row = { type: 'header'; key: string; label: string } | { type: 'log'; key: string; log: WorkoutLog };

export default function History() {
  const { colors, spacing } = useTheme();
  const logs = useWorkoutStore((s) => s.logs);
  const [refreshing, setRefreshing] = useState(false);

  const rows: Row[] = [];
  let lastMonth = '';
  logs.forEach((l) => {
    const month = formatDate(l.started_at, { month: 'long', year: 'numeric' });
    if (month !== lastMonth) {
      rows.push({ type: 'header', key: `h-${month}`, label: month });
      lastMonth = month;
    }
    rows.push({ type: 'log', key: l.id, log: l });
  });

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 48 }}
      data={rows}
      keyExtractor={(r) => r.key}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await useWorkoutStore.getState().fetchLogs().catch(() => {});
        setRefreshing(false);
      }}
      ListEmptyComponent={
        <EmptyState
          icon="time-outline"
          title="No workouts yet"
          message="Finish a workout and it will show up here."
          actionLabel="Go to Workouts"
          onAction={() => router.replace(ROUTES.workouts)}
        />
      }
      renderItem={({ item }) =>
        item.type === 'header' ? (
          <View style={{ marginTop: 16, marginBottom: 4 }}>
            <AppText variant="label" tone="muted">
              {item.label}
            </AppText>
          </View>
        ) : (
          <WorkoutLogRow log={item.log} />
        )
      }
    />
  );
}
