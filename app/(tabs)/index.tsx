import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { useProfileStore } from '@/store/profileStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { useWeightStore } from '@/store/weightStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { ROUTES } from '@/constants/routes';
import { buildSundayReview } from '@/data/sunday-advice';
import { pickNudge } from '@/data/motivation';
import { NUTRITION_TIPS, GOAL_LABELS } from '@/data/nutrition';
import { LEVEL_LABELS } from '@/data/onboarding';
import { MUSCLE_GROUPS, type WeekdayKey } from '@/types';
import { daysBetween, isSunday, startOfWeek, daysAgo, WEEKDAY_NAMES } from '@/utils/date';
import { capitalise, setsPerMuscleGroup } from '@/utils/workout';
import { convertWeight, roundWeight } from '@/utils/weight';
import { useStartWorkout } from '@/hooks/useStartWorkout';

export default function Home() {
  const { colors } = useTheme();
  const unit = useUnit();
  const profile = useProfileStore((s) => s.profile);
  const templates = useWorkoutStore((s) => s.templates);
  const logs = useWorkoutStore((s) => s.logs);
  const entries = useWeightStore((s) => s.entries);
  const activeWorkout = useActiveWorkoutStore((s) => s.active);
  const startWorkout = useStartWorkout();
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekCounts = useMemo(() => setsPerMuscleGroup(logs, weekStart), [logs, weekStart.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  const sessionsThisWeek = logs.filter((l) => new Date(l.started_at) >= weekStart).length;

  const weekNumber = profile?.onboarding_completed && profile.plan_started_at
    ? Math.floor(daysBetween(new Date(profile.plan_started_at), now) / 7) + 1
    : null;

  const todayKey = String(now.getDay()) as WeekdayKey;
  const plannedId = profile?.weekly_plan?.[todayKey];
  const todaysTemplate = plannedId ? templates.find((t) => t.id === plannedId) : undefined;
  const hasPlan = profile?.weekly_plan && Object.values(profile.weekly_plan).some(Boolean);
  const doneToday = logs.some((l) => daysBetween(new Date(l.started_at), now) === 0);

  const lastLog = logs[0];
  const daysSinceLast = lastLog ? daysBetween(new Date(lastLog.started_at), now) : null;
  const showNudge = (daysSinceLast != null && daysSinceLast >= 3) || (daysSinceLast == null && !!profile && daysBetween(new Date(profile.created_at), now) >= 3);

  const showSunday = isSunday(now) && (profile?.sunday_advice_enabled ?? true);
  const review = showSunday ? buildSundayReview(profile?.goal ?? null, profile?.level ?? null, sessionsThisWeek, weekCounts) : null;

  // Weight mini-card: latest entry vs closest entry to 4 weeks ago.
  const weightCard = useMemo(() => {
    if (entries.length === 0) return null;
    const latest = entries[entries.length - 1];
    const target = daysAgo(28).getTime();
    const older = entries
      .filter((e) => new Date(e.logged_at).getTime() <= target)
      .pop() ?? (entries.length > 1 ? entries[0] : null);
    const latestVal = convertWeight(latest.weight, latest.unit, unit);
    const olderVal = older ? convertWeight(older.weight, older.unit, unit) : null;
    return { latestVal, diff: olderVal != null ? latestVal - olderVal : null, older };
  }, [entries, unit]);

  const goalTip = useMemo(() => {
    const pool = NUTRITION_TIPS.filter((t) => !t.premium && (t.goals === 'all' || (profile?.goal && t.goals.includes(profile.goal))));
    return pool.length ? pool[now.getDate() % pool.length] : null;
  }, [profile?.goal]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        useWorkoutStore.getState().fetchLogs(),
        useWorkoutStore.getState().fetchTemplates(),
        useWeightStore.getState().fetchEntries(),
        profile ? useProfileStore.getState().fetchProfile(profile.id) : Promise.resolve(),
      ]);
    } catch {
      // keep cached data
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText variant="h1">Hey {profile?.username ?? 'there'} 💪</AppText>
      <AppText tone="secondary" style={{ marginTop: 4, marginBottom: 16 }}>
        {weekNumber != null
          ? `Week ${weekNumber} of your plan${profile?.goal ? ` · ${GOAL_LABELS[profile.goal]}` : ''}${profile?.level ? ` · ${LEVEL_LABELS[profile.level]}` : ''}`
          : `${WEEKDAY_NAMES[now.getDay()]} — let's build.`}
      </AppText>

      {activeWorkout ? (
        <Card highlight onPress={() => router.push(ROUTES.activeWorkout)} accessibilityLabel="Resume workout">
          <View style={styles.row}>
            <Ionicons name="play-circle" size={28} color={colors.onAccent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold" tone="onAccent">Workout in progress</AppText>
              <AppText variant="small" tone="onAccent">Tap to resume</AppText>
            </View>
          </View>
        </Card>
      ) : null}

      {!profile?.onboarding_completed ? (
        <Card onPress={() => router.push(ROUTES.questionnaire)} accessibilityLabel="Personalise ProjectBuilt">
          <View style={styles.row}>
            <Ionicons name="sparkles-outline" size={24} color={colors.accentText} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">Personalise your experience</AppText>
              <AppText variant="small" tone="secondary">Answer a few quick questions for tailored tips.</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>
      ) : null}

      {review ? (
        <Card style={{ borderColor: colors.accentText }}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color={colors.accentText} />
            <AppText variant="label" tone="accent" style={{ marginLeft: 6 }}>Sunday weekly review</AppText>
          </View>
          <AppText variant="h3" style={{ marginTop: 10 }}>{review.title}</AppText>
          <AppText tone="secondary" style={styles.para}>{review.summary}</AppText>
          <AppText variant="bodyBold" style={{ marginTop: 10 }}>Focus for next week</AppText>
          <AppText tone="secondary" style={styles.para}>{review.focus}</AppText>
          <AppText variant="small" tone="muted" style={{ marginTop: 10 }}>💡 {review.tip}</AppText>
        </Card>
      ) : null}

      {showNudge && !activeWorkout ? (
        <Card style={{ borderColor: colors.warning }}>
          <View style={styles.row}>
            <Ionicons name="flame-outline" size={24} color={colors.warning} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">
                {daysSinceLast != null ? `${daysSinceLast} days since your last workout` : 'Ready for your first workout?'}
              </AppText>
              <AppText variant="small" tone="secondary" style={{ marginTop: 2 }}>
                {pickNudge(now.getDate())}
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Today's workout" />
      <Card>
        {todaysTemplate ? (
          <>
            <AppText variant="h3">{todaysTemplate.name}</AppText>
            <AppText variant="small" tone="secondary" style={{ marginTop: 4 }}>
              {todaysTemplate.exercises.length} exercises · ~{todaysTemplate.estimated_minutes ?? 0} min
            </AppText>
            {doneToday ? (
              <AppText variant="small" tone="success" style={{ marginTop: 8 }}>✓ You've already trained today. Nice work!</AppText>
            ) : null}
            <Button
              title={activeWorkout ? 'Resume workout' : 'Start workout'}
              icon="play"
              onPress={() => (activeWorkout ? router.push(ROUTES.activeWorkout) : startWorkout(todaysTemplate))}
              style={{ marginTop: 14 }}
            />
          </>
        ) : hasPlan ? (
          <>
            <AppText variant="h3">Rest day</AppText>
            <AppText variant="small" tone="secondary" style={{ marginTop: 4 }}>
              Nothing planned for {WEEKDAY_NAMES[now.getDay()]}. Recover well — or start a quick session if you're feeling it.
            </AppText>
            <Button title="Quick workout" variant="secondary" onPress={() => startWorkout(null)} style={{ marginTop: 14 }} />
          </>
        ) : templates.length === 0 ? (
          <>
            <AppText variant="h3">Create your first template</AppText>
            <AppText variant="small" tone="secondary" style={{ marginTop: 4 }}>
              Build a workout from our library of 80+ exercises, then log it set by set.
            </AppText>
            <Button title="Create a workout template" icon="add" onPress={() => router.push(ROUTES.newTemplate)} style={{ marginTop: 14 }} />
          </>
        ) : (
          <>
            <AppText variant="h3">No plan set</AppText>
            <AppText variant="small" tone="secondary" style={{ marginTop: 4 }}>
              Assign your templates to days of the week to see today's workout here.
            </AppText>
            <Button title="Set up weekly plan" variant="secondary" onPress={() => router.push(ROUTES.workouts)} style={{ marginTop: 14 }} />
          </>
        )}
      </Card>

      <SectionHeader title="This week" actionLabel="Details" onAction={() => router.push(ROUTES.progress)} />
      <Card>
        <AppText variant="small" tone="secondary" style={{ marginBottom: 10 }}>
          {sessionsThisWeek} workout{sessionsThisWeek === 1 ? '' : 's'} logged since Monday
        </AppText>
        <View style={styles.chips}>
          {MUSCLE_GROUPS.map((g) => (
            <Chip key={g} label={capitalise(g)} active={weekCounts[g] > 0} />
          ))}
        </View>
      </Card>

      <SectionHeader title="Weight" actionLabel="Log weight" onAction={() => router.push(ROUTES.weightLog)} />
      <Card onPress={() => router.push(ROUTES.progress)} accessibilityLabel="Weight progress">
        {weightCard ? (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" tone="muted">Latest</AppText>
              <AppText variant="h2">{roundWeight(weightCard.latestVal)} {unit}</AppText>
            </View>
            {weightCard.diff != null ? (
              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.row}>
                  <Ionicons
                    name={weightCard.diff > 0.05 ? 'arrow-up' : weightCard.diff < -0.05 ? 'arrow-down' : 'remove'}
                    size={18}
                    color={colors.accentText}
                  />
                  <AppText variant="h3" tone="accent" style={{ marginLeft: 4 }}>
                    {weightCard.diff > 0 ? '+' : ''}
                    {roundWeight(weightCard.diff)} {unit}
                  </AppText>
                </View>
                <AppText variant="caption" tone="muted">vs 4 weeks ago</AppText>
              </View>
            ) : (
              <AppText variant="caption" tone="muted">Log again to see your trend</AppText>
            )}
          </View>
        ) : (
          <View style={styles.row}>
            <Ionicons name="scale-outline" size={24} color={colors.textMuted} />
            <AppText tone="secondary" style={{ marginLeft: 12, flex: 1 }}>
              No weigh-ins yet. Log your weight to track progress.
            </AppText>
          </View>
        )}
      </Card>

      {goalTip ? (
        <>
          <SectionHeader title={profile?.goal ? `Tip for ${GOAL_LABELS[profile.goal].toLowerCase()}` : 'Coach tip'} actionLabel="More" onAction={() => router.push(ROUTES.nutrition)} />
          <Card>
            <AppText variant="bodyBold">{goalTip.title}</AppText>
            <AppText variant="small" tone="secondary" style={styles.para} numberOfLines={4}>
              {goalTip.body}
            </AppText>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  para: { marginTop: 4, lineHeight: 21 },
});
