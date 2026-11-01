import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';
import type { WorkoutLog } from '@/types';
import { formatDateTime, formatDuration } from '@/utils/date';
import { capitalise } from '@/utils/workout';
import { AppText } from './AppText';

export function WorkoutLogRow({ log }: { log: WorkoutLog }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(ROUTES.logDetail(log.id))}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${log.template_name ?? 'Workout'}, ${formatDateTime(log.started_at)}`}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="bodyBold">{log.template_name ?? 'Quick workout'}</AppText>
        <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
          {formatDateTime(log.started_at)} · {formatDuration(log.duration_seconds)}
        </AppText>
        {log.muscle_groups_hit.length ? (
          <AppText variant="caption" tone="accent" style={{ marginTop: 4 }} numberOfLines={1}>
            {log.muscle_groups_hit.map(capitalise).join(' · ')}
          </AppText>
        ) : null}
      </View>
      {log.rating ? (
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color={colors.accentText} />
          <AppText variant="caption" weight="700" style={{ marginLeft: 3 }}>
            {log.rating}
          </AppText>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  rating: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
});
