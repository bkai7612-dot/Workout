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
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (e) =>
        (!filter ||
          (filter === 'focus'
            ? focusGroups.includes(e.primary)
            : e.primary === filter || e.secondary.includes(filter))) &&
        (!q || e.name.toLowerCase().includes(q) || e.equipment.includes(q) || e.primary.includes(q)),
    );
  }, [query, filter, focusKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setQuery('');
    setExpanded(null);
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={close} title="Add exercise" fullHeight>
      <TextField
        placeholder="Search 80+ exercises"
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
