import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatTile } from '@/components/StatTile';
import { LineChart } from '@/components/LineChart';
import { BodyMap } from '@/components/BodyMap';
import { WorkoutLogRow } from '@/components/WorkoutLogRow';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { useWeightStore } from '@/store/weightStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { ROUTES } from '@/constants/routes';
import { MUSCLE_GROUPS } from '@/types';
import { daysAgo, startOfWeek } from '@/utils/date';
import { convertWeight, roundWeight } from '@/utils/weight';
import { capitalise, setsPerMuscleGroup, workedGroups } from '@/utils/workout';

type Range = '1w' | '1m' | '3m' | 'all';
type Period = 'week' | '7d';

const RANGE_DAYS: Record<Range, number | null> = { '1w': 7, '1m': 30, '3m': 90, all: null };

export default function Progress() {
  const { colors } = useTheme();
  const unit = useUnit();
  const entries = useWeightStore((s) => s.entries);
  const logs = useWorkoutStore((s) => s.logs);
  const [range, setRange] = useState<Range>('1m');
  const [period, setPeriod] = useState<Period>('week');
  const [refreshing, setRefreshing] = useState(false);

  const weightStats = useMemo(() => {
    if (!entries.length) return null;
    const vals = entries.map((e) => convertWeight(e.weight, e.unit, unit));
    const current = vals[vals.length - 1];
    const start = vals[0];
    // Trend: latest vs the average of the previous up-to-3 entries.
    const prev = vals.slice(Math.max(0, vals.length - 4), vals.length - 1);
    const prevAvg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : current;
    const trend = current - prevAvg;
    return { current, start, change: current - start, trend };
  }, [entries, unit]);

  const chartData = useMemo(() => {
    const days = RANGE_DAYS[range];
    const since = days ? daysAgo(days).getTime() : 0;
    return entries
      .filter((e) => new Date(e.logged_at).getTime() >= since)
      .map((e) => ({ x: new Date(e.logged_at).getTime(), y: convertWeight(e.weight, e.unit, unit) }));
  }, [entries, range, unit]);

  const since = period === "week" ? startOfWeek() : daysAgo(7);
  const counts = useMemo(() => setsPerMuscleGroup(logs, since), [logs, period]); // eslint-disable-line react-hooks/exhaustive-deps
  const worked = workedGroups(counts);
  const maxSets = Math.max(1, ...MUSCLE_GROUPS.map((g) => counts[g]));

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([
      useWeightStore.getState().fetchEntries().catch(() => {}),
      useWorkoutStore.getState().fetchLogs().catch(() => {}),
    ]);
    setRefreshing(false);
  };

  const trendIcon = !weightStats
    ? 'remove'
    : weightStats.trend > 0.05
      ? 'trending-up'
      : weightStats.trend < -0.05
        ? 'trending-down'
        : 'remove';

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText variant="h1">Progress</AppText>

      <SectionHeader title="Body weight" actionLabel="+ Log weight" onAction={() => router.push(ROUTES.weightLog)} />
      <Card>
        {weightStats ? (
          <>
            <View style={styles.tiles}>
              <StatTile
                label="Current"
                value={`${roundWeight(weightStats.current)} ${unit}`}
                sub={
                  <View style={styles.row}>
                    <Ionicons name={trendIcon} size={16} color={colors.accentText} />
                    <AppText variant="caption" tone="accent" style={{ marginLeft: 4 }}>
                      trend
                    </AppText>
                  </View>
                }
              />
              <StatTile label="Starting" value={`${roundWeight(weightStats.start)} ${unit}`} />
              <StatTile
                label="Total change"
                value={`${weightStats.change > 0 ? '+' : ''}${roundWeight(weightStats.change)} ${unit}`}
              />
            </View>
            <SegmentedControl<Range>
              size="sm"
              value={range}
              onChange={setRange}
              options={[
                { value: '1w', label: '1W' },
                { value: '1m', label: '1M' },
                { value: '3m', label: '3M' },
                { value: 'all', label: 'All' },
              ]}
              style={{ marginVertical: 12 }}
            />
            <LineChart data={chartData} formatY={(v) => v.toFixed(unit === 'kg' ? 1 : 0)} />
          </>
        ) : (
          <EmptyState
            icon="scale-outline"
            title="Track your weight"
            message="Log your body weight regularly — same time of day is best — to see your trend."
            actionLabel="Log weight"
            onAction={() => router.push(ROUTES.weightLog)}
          />
        )}
      </Card>

      <SectionHeader title="Muscles worked" />
      <Card>
        <SegmentedControl<Period>
          size="sm"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'week', label: 'This week' },
            { value: '7d', label: 'Last 7 days' },
          ]}
        />
        <BodyMap worked={worked} />
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <AppText variant="caption" tone="muted" style={{ marginRight: 16 }}>Worked</AppText>
          <View style={[styles.dot, { backgroundColor: colors.muted }]} />
          <AppText variant="caption" tone="muted">Not yet</AppText>
        </View>
        {MUSCLE_GROUPS.map((g) => (
          <View key={g} style={styles.setRow}>
            <AppText variant="small" style={{ width: 90 }}>
              {capitalise(g)}
            </AppText>
            <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(counts[g] / maxSets) * 100}%`, backgroundColor: counts[g] ? colors.accent : 'transparent' },
                ]}
              />
            </View>
            <AppText variant="small" weight="700" style={{ width: 56, textAlign: 'right' }}>
              {counts[g]} {counts[g] === 1 ? 'set' : 'sets'}
            </AppText>
          </View>
        ))}
      </Card>

      <SectionHeader title="Recent workouts" actionLabel="See all" onAction={() => router.push(ROUTES.history)} />
      {logs.length === 0 ? (
        <Card>
          <EmptyState icon="time-outline" title="No workouts logged" message="Your completed workouts will appear here." />
        </Card>
      ) : (
        <Card style={{ paddingVertical: 4 }}>
          {logs.slice(0, 5).map((l) => (
            <WorkoutLogRow key={l.id} log={l} />
          ))}
        </Card>
      )}
      {logs.length > 5 ? (
        <Button title="View full history" variant="outline" onPress={() => router.push(ROUTES.history)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
});
