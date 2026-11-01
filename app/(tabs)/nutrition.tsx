import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Banner } from '@/components/Banner';
import { UpsellModal } from '@/components/UpsellModal';
import { useTheme } from '@/hooks/useTheme';
import { usePremium } from '@/hooks/usePremium';
import { useProfileStore } from '@/store/profileStore';
import { GOAL_LABELS, NUTRITION_CATEGORIES, NUTRITION_DISCLAIMER, NUTRITION_TIPS } from '@/data/nutrition';
import type { Goal, NutritionTip } from '@/types';

type GoalFilter = Goal | 'all';

function TipCard({ tip, locked, onLocked }: { tip: NutritionTip; locked: boolean; onLocked: () => void }) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Card onPress={locked ? onLocked : undefined} accessibilityLabel={locked ? `${tip.title}, Premium tip, locked` : undefined}>
      <View style={styles.titleRow}>
        <AppText variant="bodyBold" style={{ flex: 1 }}>
          {tip.title}
        </AppText>
        {tip.premium ? (
          <View style={[styles.badge, { backgroundColor: locked ? colors.surfaceAlt : colors.accent }]}>
            <Ionicons name={locked ? 'lock-closed' : 'flash'} size={12} color={locked ? colors.textSecondary : colors.onAccent} />
            <AppText variant="caption" weight="700" style={{ marginLeft: 4, color: locked ? colors.textSecondary : colors.onAccent }}>
              Premium
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 6 }}>
        <AppText variant="small" tone="secondary" style={{ lineHeight: 21 }} numberOfLines={locked ? 3 : undefined}>
          {tip.body}
        </AppText>
        {locked ? (
          <BlurView intensity={theme.dark ? 25 : 18} tint={theme.dark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, styles.lock]}>
            <View style={[styles.lockPill, { backgroundColor: colors.accent }]}>
              <Ionicons name="lock-closed" size={14} color={colors.onAccent} />
              <AppText variant="caption" weight="700" tone="onAccent" style={{ marginLeft: 6 }}>
                Unlock with Premium
              </AppText>
            </View>
          </BlurView>
        ) : null}
      </View>
    </Card>
  );
}

export default function Nutrition() {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const userGoal = useProfileStore((s) => s.profile?.goal ?? null);
  const [filter, setFilter] = useState<GoalFilter>(userGoal ?? 'all');
  const [upsell, setUpsell] = useState(false);

  const visible = useMemo(
    () => NUTRITION_TIPS.filter((t) => filter === 'all' || t.goals === 'all' || t.goals.includes(filter)),
    [filter],
  );

  return (
    <Screen>
      <AppText variant="h1">Nutrition</AppText>
      <AppText tone="secondary" style={{ marginTop: 4, marginBottom: 12 }}>
        Practical advice from your coach — a qualified PT with a nutrition qualification.
      </AppText>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="All goals" active={filter === 'all'} onPress={() => setFilter('all')} />
          {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
            <Chip key={g} label={`${GOAL_LABELS[g]}${g === userGoal ? ' (you)' : ''}`} active={filter === g} onPress={() => setFilter(g)} />
          ))}
        </ScrollView>
      </View>

      {NUTRITION_CATEGORIES.map((cat) => {
        const tips = visible.filter((t) => t.category === cat.id);
        if (!tips.length) return null;
        return (
          <View key={cat.id}>
            <View style={styles.catHeader}>
              <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.accentText} />
              <AppText variant="h3" style={{ marginLeft: 8 }}>
                {cat.id === 'goal' && filter !== 'all' ? `For ${GOAL_LABELS[filter].toLowerCase()}` : cat.title}
              </AppText>
            </View>
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} locked={tip.premium && !isPremium} onLocked={() => setUpsell(true)} />
            ))}
          </View>
        );
      })}

      <Banner message={NUTRITION_DISCLAIMER} />

      <UpsellModal
        visible={upsell}
        onClose={() => setUpsell(false)}
        title="Premium nutrition tips"
        message="Unlock every coaching tip — diet breaks, carb periodisation, supplement deep-dives and more — plus unlimited templates and chat with your coach."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 10 },
  lock: { alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' },
  lockPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
});
