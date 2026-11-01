import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { SectionHeader } from '@/components/SectionHeader';
import { UpsellModal } from '@/components/UpsellModal';
import { useTheme } from '@/hooks/useTheme';
import { useUnit } from '@/hooks/useUnit';
import { usePremium } from '@/hooks/usePremium';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useWorkoutStore } from '@/store/workoutStore';
import type { WorkoutSource } from '@/store/activeWorkoutStore';
import { FREE_TEMPLATE_LIMIT } from '@/constants/routes';
import {
  PREMADE_WORKOUTS,
  canDoWithEquipment,
  premadeMuscles,
  premadeToExercises,
} from '@/data/premade-workouts';
import { EQUIPMENT_LABELS, LEVEL_LABELS } from '@/data/onboarding';
import { MUSCLE_GROUPS, type MuscleGroup } from '@/types';
import { generateWorkout } from '@/utils/generateWorkout';
import { uid } from '@/utils/id';
import { capitalise, estimateTemplateMinutes } from '@/utils/workout';
import { errorMessage } from '@/utils/validation';

function ExerciseList({ source }: { source: WorkoutSource }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 10 }}>
      {source.exercises.map((e, i) => (
        <View key={e.id} style={[styles.exRow, { borderBottomColor: colors.border }]}>
          <AppText variant="small" tone="muted" style={{ width: 22 }}>
            {i + 1}
          </AppText>
          <View style={{ flex: 1 }}>
            <AppText variant="small" weight="600">
              {e.name}
            </AppText>
            <AppText variant="caption" tone="muted">
              {capitalise(e.muscleGroup)}
            </AppText>
          </View>
          <AppText variant="small" tone="secondary">
            {e.sets} × {e.reps}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export default function QuickWorkout() {
  const { colors } = useTheme();
  const unit = useUnit();
  const { isPremium } = usePremium();
  const startWorkout = useStartWorkout();
  const userId = useAuthStore((s) => s.session?.user.id);
  const profile = useProfileStore((s) => s.profile);
  const templates = useWorkoutStore((s) => s.templates);
  const createTemplate = useWorkoutStore((s) => s.createTemplate);

  const [selected, setSelected] = useState<MuscleGroup[]>([]);
  const [seed, setSeed] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [upsell, setUpsell] = useState(false);

  const equipment = profile?.equipment ?? null;

  const toggle = (g: MuscleGroup) =>
    setSelected((list) => (list.includes(g) ? list.filter((x) => x !== g) : [...list, g]));

  const generated = useMemo<WorkoutSource | null>(() => {
    if (!selected.length) return null;
    const g = generateWorkout({ muscles: selected, equipment, goal: profile?.goal ?? null, level: profile?.level ?? null, unit, seed });
    return { id: null, name: g.name, exercises: g.exercises };
  }, [selected, equipment, profile?.goal, profile?.level, unit, seed]);

  const premade = useMemo(
    () =>
      PREMADE_WORKOUTS.map((w) => ({ w, muscles: premadeMuscles(w) }))
        .filter(({ muscles }) => !selected.length || muscles.some((m) => selected.includes(m)))
        // Best match first: most overlap with the selection, then what the user's equipment allows.
        .sort((a, b) => {
          const overlap = (m: MuscleGroup[]) => m.filter((x) => selected.includes(x)).length;
          const fits = (x: typeof a) => (canDoWithEquipment(x.w.equipment, equipment) ? 1 : 0);
          return overlap(b.muscles) - overlap(a.muscles) || fits(b) - fits(a);
        }),
    [selected, equipment],
  );

  const saveAsTemplate = async (key: string, source: WorkoutSource) => {
    if (!userId) return;
    if (!isPremium && templates.length >= FREE_TEMPLATE_LIMIT) {
      setUpsell(true);
      return;
    }
    setSaving(key);
    try {
      await createTemplate(userId, { name: source.name, description: null, exercises: source.exercises });
      Alert.alert('Saved', `"${source.name}" is now in your templates.`);
    } catch (e) {
      if (errorMessage(e) === 'TEMPLATE_LIMIT') setUpsell(true);
      else Alert.alert('Could not save', errorMessage(e));
    } finally {
      setSaving(null);
    }
  };

  return (
    <Screen edges={[]}>
      <AppText variant="h3">What do you want to train?</AppText>
      <AppText variant="small" tone="secondary" style={{ marginTop: 4, marginBottom: 12 }}>
        Pick one or more muscle groups and we'll build a workout
        {equipment ? ` for ${EQUIPMENT_LABELS[equipment].toLowerCase()}` : ''} — or choose a pre-made one below.
      </AppText>
      <View style={styles.chips}>
        {MUSCLE_GROUPS.map((g) => (
          <Chip key={g} label={capitalise(g)} active={selected.includes(g)} onPress={() => toggle(g)} />
        ))}
      </View>
      {selected.length ? (
        <Pressable onPress={() => setSelected([])} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
          <AppText variant="small" tone="accent" weight="700">
            Clear selection
          </AppText>
        </Pressable>
      ) : null}

      {generated ? (
        <>
          <SectionHeader title="Built for you" />
          <Card style={{ borderColor: colors.accentText }}>
            <AppText variant="h3">{generated.name}</AppText>
            <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {generated.exercises.length} exercises · ~{estimateTemplateMinutes(generated.exercises)} min
            </AppText>
            {generated.exercises.length ? (
              <ExerciseList source={generated} />
            ) : (
              <AppText variant="small" tone="secondary" style={{ marginTop: 8 }}>
                No exercises match that selection with your equipment. Try another muscle group.
              </AppText>
            )}
            <View style={styles.actions}>
              <Button title="Start" icon="play" size="sm" disabled={!generated.exercises.length} onPress={() => startWorkout(generated)} style={{ flex: 1 }} />
              <Button title="Shuffle" icon="shuffle" size="sm" variant="secondary" onPress={() => setSeed((s) => s + 1)} style={{ flex: 1 }} />
              <Button
                title="Save"
                icon="bookmark-outline"
                size="sm"
                variant="secondary"
                disabled={!generated.exercises.length}
                loading={saving === 'generated'}
                onPress={() => saveAsTemplate('generated', generated)}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </>
      ) : null}

      <SectionHeader title={selected.length ? `Pre-made workouts for ${selected.map(capitalise).join(', ')}` : 'Pre-made workouts'} />
      {premade.length === 0 ? (
        <AppText variant="small" tone="muted" style={{ marginBottom: 12 }}>
          No pre-made workouts for that selection — use the one built for you above.
        </AppText>
      ) : null}
      {premade.map(({ w, muscles }) => {
        const source: WorkoutSource = { id: null, name: w.name, exercises: premadeToExercises(w, uid, unit) };
        const open = expanded === w.id;
        const fits = canDoWithEquipment(w.equipment, equipment);
        return (
          <Card key={w.id} onPress={() => setExpanded(open ? null : w.id)} accessibilityLabel={`${w.name}, show exercises`}>
            <View style={styles.titleRow}>
              <AppText variant="h3" style={{ flex: 1 }}>
                {w.name}
              </AppText>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>
            <AppText variant="small" tone="secondary" style={{ marginTop: 2 }}>
              {w.description}
            </AppText>
            <AppText variant="caption" tone="muted" style={{ marginTop: 6 }}>
              {w.items.length} exercises · ~{estimateTemplateMinutes(source.exercises)} min · {LEVEL_LABELS[w.level]} · {EQUIPMENT_LABELS[w.equipment]}
            </AppText>
            <AppText variant="caption" tone="accent" style={{ marginTop: 4 }}>
              {muscles.map(capitalise).join(' · ')}
            </AppText>
            {!fits ? (
              <AppText variant="caption" style={{ marginTop: 4, color: colors.warning }}>
                Needs more equipment than your profile lists.
              </AppText>
            ) : null}
            {open ? <ExerciseList source={source} /> : null}
            <View style={styles.actions}>
              <Button title="Start" icon="play" size="sm" onPress={() => startWorkout(source)} style={{ flex: 1 }} />
              <Button
                title="Save as template"
                icon="bookmark-outline"
                size="sm"
                variant="secondary"
                loading={saving === w.id}
                onPress={() => saveAsTemplate(w.id, source)}
                style={{ flex: 1.4 }}
              />
            </View>
          </Card>
        );
      })}

      <Button title="Start an empty workout" variant="ghost" onPress={() => startWorkout(null)} style={{ marginTop: 4 }} />

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
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
});
