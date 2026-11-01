import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { UpsellModal } from '@/components/UpsellModal';
import { AppModal } from '@/components/AppModal';
import { useTheme } from '@/hooks/useTheme';
import { usePremium } from '@/hooks/usePremium';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useWorkoutStore } from '@/store/workoutStore';
import { useProfileStore } from '@/store/profileStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { FREE_TEMPLATE_LIMIT, ROUTES } from '@/constants/routes';
import type { WeekdayKey, WorkoutTemplate } from '@/types';
import { WEEKDAY_NAMES, WEEK_ORDER } from '@/utils/date';
import { capitalise, muscleGroupsFromExercises } from '@/utils/workout';
import { errorMessage } from '@/utils/validation';

export default function Workouts() {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const startWorkout = useStartWorkout();
  const templates = useWorkoutStore((s) => s.templates);
  const deleteTemplate = useWorkoutStore((s) => s.deleteTemplate);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const activeWorkout = useActiveWorkoutStore((s) => s.active);
  const [upsell, setUpsell] = useState(false);
  const [planDay, setPlanDay] = useState<WeekdayKey | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const atLimit = !isPremium && templates.length >= FREE_TEMPLATE_LIMIT;
  const plan = profile?.weekly_plan ?? {};

  const newTemplate = () => {
    if (atLimit) setUpsell(true);
    else router.push(ROUTES.newTemplate);
  };

  const confirmDelete = (t: WorkoutTemplate) =>
    Alert.alert('Delete template?', `"${t.name}" will be removed. Your past workout logs are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTemplate(t.id);
            // Remove it from the weekly plan too.
            const cleaned = Object.fromEntries(Object.entries(plan).filter(([, id]) => id !== t.id));
            if (Object.keys(cleaned).length !== Object.keys(plan).length) await updateProfile({ weekly_plan: cleaned });
          } catch (e) {
            Alert.alert('Could not delete', errorMessage(e));
          }
        },
      },
    ]);

  const assign = async (day: WeekdayKey, templateId: string | null) => {
    setPlanDay(null);
    const next = { ...plan };
    if (templateId) next[day] = templateId;
    else delete next[day];
    try {
      await updateProfile({ weekly_plan: next });
    } catch (e) {
      Alert.alert('Could not update plan', errorMessage(e));
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await useWorkoutStore.getState().fetchTemplates().catch(() => {});
    setRefreshing(false);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText variant="h1">Workouts</AppText>

      <View style={styles.actions}>
        {activeWorkout ? (
          <Button title="Resume" icon="play" size="sm" onPress={() => router.push(ROUTES.activeWorkout)} />
        ) : null}
        <Button
          title="Quick workout"
          icon="flash-outline"
          size="sm"
          variant={activeWorkout ? 'secondary' : 'primary'}
          onPress={() => router.push(ROUTES.quickWorkout)}
        />
        <Button title="New template" icon="add" size="sm" variant="secondary" onPress={newTemplate} />
        <Button title="History" icon="time-outline" size="sm" variant="secondary" onPress={() => router.push(ROUTES.history)} />
      </View>

      <SectionHeader
        title={isPremium ? `My templates (${templates.length})` : `My templates (${templates.length}/${FREE_TEMPLATE_LIMIT})`}
      />
      {templates.length === 0 ? (
        <Card>
          <EmptyState
            icon="barbell-outline"
            title="No templates yet"
            message="Create a template to plan your sessions and log them in a couple of taps."
            actionLabel="Create template"
            onAction={newTemplate}
          />
        </Card>
      ) : (
        templates.map((t) => {
          const groups = muscleGroupsFromExercises(t.exercises);
          return (
            <Card key={t.id} onPress={() => router.push(ROUTES.editTemplate(t.id))} accessibilityLabel={`Edit ${t.name}`}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppText variant="h3">{t.name}</AppText>
                  {t.description ? (
                    <AppText variant="small" tone="secondary" numberOfLines={2} style={{ marginTop: 2 }}>
                      {t.description}
                    </AppText>
                  ) : null}
                  <AppText variant="caption" tone="muted" style={{ marginTop: 6 }}>
                    {t.exercises.length} exercises · ~{t.estimated_minutes ?? 0} min
                    {groups.length ? ` · ${groups.slice(0, 4).map(capitalise).join(', ')}` : ''}
                  </AppText>
                </View>
                <Pressable onPress={() => confirmDelete(t)} hitSlop={10} style={{ padding: 6 }} accessibilityLabel={`Delete ${t.name}`}>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
              <Button title="Start" icon="play" size="sm" onPress={() => startWorkout(t)} style={{ marginTop: 12, alignSelf: 'flex-start' }} />
            </Card>
          );
        })
      )}
      {atLimit ? (
        <Pressable onPress={() => setUpsell(true)}>
          <AppText variant="small" tone="accent" center weight="700" style={{ marginBottom: 8 }}>
            You've reached the free limit of {FREE_TEMPLATE_LIMIT} templates — upgrade for unlimited.
          </AppText>
        </Pressable>
      ) : null}

      <SectionHeader title="My weekly plan" />
      <Card>
        <AppText variant="small" tone="secondary" style={{ marginBottom: 6 }}>
          Assign a template to each training day. Today's workout appears on your Home screen.
        </AppText>
        {WEEK_ORDER.map((d) => {
          const key = String(d) as WeekdayKey;
          const tpl = templates.find((t) => t.id === plan[key]);
          return (
            <Pressable
              key={key}
              onPress={() => setPlanDay(key)}
              style={[styles.planRow, { borderBottomColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={`${WEEKDAY_NAMES[d]}: ${tpl?.name ?? 'Rest'}`}
            >
              <AppText variant="bodyBold" style={{ width: 110 }}>
                {WEEKDAY_NAMES[d]}
              </AppText>
              <AppText style={{ flex: 1, color: tpl ? colors.accentText : colors.textMuted }} numberOfLines={1}>
                {tpl?.name ?? 'Rest'}
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          );
        })}
      </Card>

      <AppModal
        visible={planDay != null}
        onClose={() => setPlanDay(null)}
        title={planDay != null ? WEEKDAY_NAMES[Number(planDay)] : ''}
      >
        <FlatList
          data={[null, ...templates]}
          keyExtractor={(t) => t?.id ?? 'rest'}
          renderItem={({ item }) => {
            const selected = planDay != null && (plan[planDay] ?? null) === (item?.id ?? null);
            return (
              <Pressable
                onPress={() => planDay && assign(planDay, item?.id ?? null)}
                style={[styles.planRow, { borderBottomColor: colors.border }]}
              >
                <AppText style={{ flex: 1 }} weight={selected ? '700' : '400'}>
                  {item?.name ?? 'Rest day'}
                </AppText>
                {selected ? <Ionicons name="checkmark" size={20} color={colors.accentText} /> : null}
              </Pressable>
            );
          }}
        />
      </AppModal>

      <UpsellModal
        visible={upsell}
        onClose={() => setUpsell(false)}
        title="Template limit reached"
        message="Upgrade to Premium for unlimited templates."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  planRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
