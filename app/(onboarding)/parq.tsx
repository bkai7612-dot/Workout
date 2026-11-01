import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useProfileStore } from '@/store/profileStore';
import { PARQ_CLEAR_MESSAGE, PARQ_INTRO, PARQ_QUESTIONS, PARQ_REFER_MESSAGE } from '@/data/parq';
import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/utils/validation';

type Answer = 'yes' | 'no' | null;

export default function Parq() {
  const { colors, radius } = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [answers, setAnswers] = useState<Answer[]>(PARQ_QUESTIONS.map(() => null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<'cleared' | 'refer' | null>(null);

  const allAnswered = answers.every((a) => a !== null);

  const submit = async () => {
    if (!allAnswered) return setError('Please answer every question.');
    const cleared = answers.every((a) => a === 'no');
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        parq_completed: true,
        parq_cleared: cleared,
        ...(from === 'onboarding'
          ? { onboarding_completed: true, plan_started_at: profile?.plan_started_at ?? new Date().toISOString() }
          : {}),
      });
      setResult(cleared ? 'cleared' : 'refer');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const done = () => {
    if (from === 'onboarding') router.replace(ROUTES.home);
    else router.back();
  };

  if (result) {
    const refer = result === 'refer';
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons
            name={refer ? 'medkit-outline' : 'checkmark-circle-outline'}
            size={64}
            color={refer ? colors.warning : colors.accentText}
          />
          <AppText variant="h1" center style={{ marginTop: 16 }}>
            {refer ? 'Please speak to your GP' : "You're good to go"}
          </AppText>
        </View>
        <Card style={{ marginTop: 24, borderColor: refer ? colors.warning : colors.border }}>
          <AppText tone="secondary" style={{ lineHeight: 22 }}>
            {refer ? PARQ_REFER_MESSAGE : PARQ_CLEAR_MESSAGE}
          </AppText>
        </Card>
        <Button title={refer ? 'I understand' : "Let's go"} onPress={done} style={{ marginTop: 12 }} />
      </Screen>
    );
  }

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {error ? (
            <AppText variant="caption" tone="danger" style={{ marginBottom: 8 }}>
              {error}
            </AppText>
          ) : null}
          <Button title="Submit health check" onPress={submit} loading={saving} disabled={!allAnswered} />
        </View>
      }
    >
      <View style={styles.topRow}>
        <AppText variant="label" tone="accent">
          Health screening · PAR-Q
        </AppText>
        {from !== 'onboarding' ? (
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <AppText variant="h1" style={{ marginTop: 6 }}>
        Before you start
      </AppText>
      <AppText tone="secondary" style={{ marginTop: 8, marginBottom: 20, lineHeight: 22 }}>
        {PARQ_INTRO} This is required before you log any workouts.
      </AppText>
      {PARQ_QUESTIONS.map((q, i) => (
        <Card key={i}>
          <AppText variant="bodyBold" style={{ lineHeight: 22 }}>
            {i + 1}. {q}
          </AppText>
          <View style={styles.answerRow}>
            {(['yes', 'no'] as const).map((value) => {
              const selected = answers[i] === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setAnswers((a) => a.map((x, j) => (j === i ? value : x)))}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Question ${i + 1}: ${value}`}
                  style={[
                    styles.answer,
                    {
                      borderRadius: radius.md,
                      backgroundColor: selected ? (value === 'yes' ? colors.warning : colors.accent) : colors.surfaceAlt,
                    },
                  ]}
                >
                  <AppText variant="bodyBold" style={{ color: selected ? colors.onAccent : colors.text }}>
                    {value === 'yes' ? 'Yes' : 'No'}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}
      <AppText variant="caption" tone="muted" style={{ marginTop: 4 }}>
        We only store whether you completed the PAR-Q and whether you were advised to consult a GP — not your individual answers.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  answerRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  answer: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
