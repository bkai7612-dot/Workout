import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { EXERCISES } from '@/data/exercises';
import { MUSCLE_GROUPS, type LibraryExercise, type MuscleGroup } from '@/types';
import { capitalise } from '@/utils/workout';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { Chip } from './Chip';
import { TextField } from './TextField';
import { Button } from './Button';

/** Common gym shorthand people type into search. */
const SYNONYMS: Record<string, string> = {
  db: 'dumbbell',
  dbs: 'dumbbell',
  bb: 'barbell',
  kb: 'kettlebell',
  bw: 'bodyweight',
  pecs: 'chest',
  lats: 'back',
  delts: 'shoulders',
  quads: 'legs',
  hamstrings: 'legs',
  hams: 'legs',
  calves: 'legs',
  abs: 'core',
  bum: 'glutes',
  glute: 'glutes',
  bicep: 'biceps',
  tricep: 'triceps',
  shoulder: 'shoulders',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectLibrary: (exercise: LibraryExercise) => void;
  onAddCustom: (name: string) => void;
  /** Muscle groups the template targets: shown first as a "Your muscles" filter. */
  focusGroups?: MuscleGroup[];
}

export function ExercisePicker({ visible, onClose, onSelectLibrary, onAddCustom, focusGroups = [] }: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'focus' | null>(null);
  const focusKey = focusGroups.join(',');

  useEffect(() => {
    if (visible) setFilter(focusGroups.length ? 'focus' : null);
  }, [visible, focusKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = useMemo(() => {
    // Every word must match the name, a muscle or the equipment ("incline db", "cable chest", "glute").
    const tokens = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => SYNONYMS[t] ?? t);
    return EXERCISES.filter((e) => {
      const inFilter =
        !filter ||
        (filter === 'focus'
          ? focusGroups.includes(e.primary)
          : e.primary === filter || e.secondary.includes(filter));
      if (!inFilter) return false;
      if (!tokens.length) return true;
      const haystack = `${e.name} ${e.primary} ${e.secondary.join(' ')} ${e.equipment}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    }).sort((a, b) => {
      // Rank direct hits (name or primary muscle) above secondary-muscle matches.
      const score = (e: LibraryExercise) =>
        tokens.filter((t) => `${e.name} ${e.primary}`.toLowerCase().includes(t)).length * 2 +
        (filter && filter !== 'focus' && e.primary === filter ? 1 : 0);
      return score(b) - score(a);
    });
  }, [query, filter, focusKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setQuery('');
    setExpanded(null);
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={close} title="Add exercise" fullHeight>
      <TextField
        placeholder={`Search ${EXERCISES.length} exercises — e.g. "incline db"`}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search exercises"
      />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
          {focusGroups.length ? (
            <Chip label="Your muscles" active={filter === 'focus'} onPress={() => setFilter('focus')} />
          ) : null}
          <Chip label="All" active={!filter} onPress={() => setFilter(null)} />
          {MUSCLE_GROUPS.map((g) => (
            <Chip key={g} label={capitalise(g)} active={filter === g} onPress={() => setFilter(g)} />
          ))}
        </ScrollView>
      </View>
      {query.trim().length > 1 ? (
        <Button
          title={`Add "${query.trim()}" as custom exercise`}
          variant="secondary"
          size="sm"
          icon="add"
          onPress={() => {
            onAddCustom(query.trim());
            close();
          }}
          style={{ marginBottom: 8 }}
        />
      ) : null}
      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        ListEmptyComponent={
          <AppText tone="muted" center style={{ marginTop: 24 }}>
            No matches. Add it as a custom exercise above.
          </AppText>
        }
        renderItem={({ item }) => (
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <View style={styles.itemRow}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  onSelectLibrary(item);
                  close();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.name}`}
              >
                <AppText variant="bodyBold">{item.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {capitalise(item.primary)}
                  {item.secondary.length ? ` · ${item.secondary.map(capitalise).join(', ')}` : ''} · {capitalise(item.equipment)}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => setExpanded(expanded === item.id ? null : item.id)}
                hitSlop={10}
                accessibilityLabel={`How to do ${item.name}`}
                style={{ padding: 6 }}
              >
                <Ionicons name={expanded === item.id ? 'chevron-up' : 'information-circle-outline'} size={22} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => {
                  onSelectLibrary(item);
                  close();
                }}
                hitSlop={10}
                style={{ padding: 6 }}
                accessibilityLabel={`Add ${item.name}`}
              >
                <Ionicons name="add-circle" size={26} color={colors.accentText} />
              </Pressable>
            </View>
            {expanded === item.id ? (
              <View style={{ marginTop: 8 }}>
                {item.instructions.map((step, i) => (
                  <AppText key={i} variant="small" tone="secondary" style={{ marginBottom: 4 }}>
                    {i + 1}. {step}
                  </AppText>
                ))}
              </View>
            ) : null}
          </View>
        )}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  item: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
});
