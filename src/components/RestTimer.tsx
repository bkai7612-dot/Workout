import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useTheme } from '@/hooks/useTheme';
import { formatClock } from '@/utils/date';
import { AppText } from './AppText';

/** Floating rest countdown. Auto-starts when a set is completed; dismissible. */
export function RestTimer() {
  const { colors, radius } = useTheme();
  const restEndsAt = useActiveWorkoutStore((s) => s.restEndsAt);
  const restDuration = useActiveWorkoutStore((s) => s.restDuration);
  const extendRest = useActiveWorkoutStore((s) => s.extendRest);
  const skipRest = useActiveWorkoutStore((s) => s.skipRest);
  const [now, setNow] = useState(Date.now());
  const buzzed = useRef<number | null>(null);

  useEffect(() => {
    if (!restEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [restEndsAt]);

  useEffect(() => {
    if (restEndsAt && now >= restEndsAt && buzzed.current !== restEndsAt) {
      buzzed.current = restEndsAt;
      Vibration.vibrate([0, 300, 150, 300]);
      const t = setTimeout(skipRest, 1500);
      return () => clearTimeout(t);
    }
  }, [now, restEndsAt, skipRest]);

  if (!restEndsAt) return null;
  const remaining = Math.max(0, Math.ceil((restEndsAt - now) / 1000));
  const progress = restDuration > 0 ? 1 - remaining / restDuration : 1;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={[styles.progress, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: colors.accent }]} />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" tone="muted">
            {remaining === 0 ? 'Rest complete — next set!' : 'Rest'}
          </AppText>
          <AppText variant="h2" accessibilityLiveRegion="polite">
            {formatClock(remaining)}
          </AppText>
        </View>
        <Pressable onPress={() => extendRest(-15)} style={[styles.btn, { borderColor: colors.border }]} accessibilityLabel="Subtract 15 seconds">
          <AppText variant="small" weight="700">−15s</AppText>
        </Pressable>
        <Pressable onPress={() => extendRest(15)} style={[styles.btn, { borderColor: colors.border }]} accessibilityLabel="Add 15 seconds">
          <AppText variant="small" weight="700">+15s</AppText>
        </Pressable>
        <Pressable onPress={skipRest} style={[styles.btn, { backgroundColor: colors.accent, borderColor: colors.accent }]} accessibilityLabel="Skip rest">
          <AppText variant="small" weight="700" tone="onAccent">Skip</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, bottom: 12, borderWidth: 1, overflow: 'hidden' },
  progress: { position: 'absolute', left: 0, top: 0, height: 3 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  btn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
