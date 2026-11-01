import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { OptionButton } from '@/components/OptionButton';
import { TextField } from '@/components/TextField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useTheme } from '@/hooks/useTheme';
import { useProfileStore } from '@/store/profileStore';
import { ROUTES } from '@/constants/routes';
import {
  DAYS_OPTIONS,
  EQUIPMENT_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
} from '@/data/onboarding';
import type { Equipment, Gender, Goal, Level, WeightUnit } from '@/types';
import { parseNumber } from '@/utils/weight';
import { errorMessage } from '@/utils/validation';

const TOTAL_STEPS = 7;

export default function Questionnaire() {
  const { colors, radius } = useTheme();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(profile?.goal ?? null);
  const [days, setDays] = useState<number | null>(profile?.days_per_week ?? null);
  const [level, setLevel] = useState<Level | null>(profile?.level ?? null);
  const [equipment, setEquipment] = useState<Equipment | null>(profile?.equipment ?? null);
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [weight, setWeight] = useState(profile?.current_weight ? String(profile.current_weight) : '');
  const [unit, setUnit] = useState<WeightUnit>(profile?.weight_unit ?? 'kg');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const skip = () => router.replace(ROUTES.home);

  const canContinue = [goal, days, level, equipment, gender].map((v) => v != null);
  const optional = step >= 5; // age + weight are optional

  const finish = async () => {
    const ageNum = age ? parseInt(age, 10) : null;
    if (ageNum != null && (Number.isNaN(ageNum) || ageNum < 16 || ageNum > 100)) {
      setStep(5);
      return setError('Please enter an age between 16 and 100, or leave it blank.');
    }
    const weightNum = parseNumber(weight);
    if (weight && (weightNum == null || weightNum <= 20 || weightNum > 700)) {
      return setError('Please enter a valid weight, or leave it blank.');
    }
    setSaving(true);
    try {
      await updateProfile({
        goal,
        days_per_week: days,
        level,
        equipment,
        gender,
        age: ageNum,
        current_weight: weightNum,
        weight_unit: unit,
      });
      router.push({ pathname: ROUTES.parq, params: { from: 'onboarding' } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    setError(null);
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else finish();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <AppText variant="h2" style={styles.q}>What is your main goal?</AppText>
            {GOAL_OPTIONS.map((o) => (
              <OptionButton key={o.value} label={o.label} description={o.description} selected={goal === o.value} onPress={() => setGoal(o.value)} />
            ))}
          </>
        );
      case 1:
        return (
          <>
            <AppText variant="h2" style={styles.q}>How many days per week can you train?</AppText>
            <View style={styles.daysRow}>
              {DAYS_OPTIONS.map((d) => {
                const selected = days === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDays(d)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${d} days`}
                    style={[
                      styles.day,
                      { borderRadius: radius.md, backgroundColor: selected ? colors.accent : colors.surface, borderColor: selected ? colors.accent : colors.border },
                    ]}
                  >
                    <AppText variant="h2" style={{ color: selected ? colors.onAccent : colors.text }}>{d}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      case 2:
        return (
          <>
            <AppText variant="h2" style={styles.q}>What's your fitness level?</AppText>
            {LEVEL_OPTIONS.map((o) => (
              <OptionButton key={o.value} label={o.label} description={o.description} selected={level === o.value} onPress={() => setLevel(o.value)} />
            ))}
          </>
        );
      case 3:
        return (
          <>
            <AppText variant="h2" style={styles.q}>What equipment do you have access to?</AppText>
            {EQUIPMENT_OPTIONS.map((o) => (
              <OptionButton key={o.value} label={o.label} description={o.description} selected={equipment === o.value} onPress={() => setEquipment(o.value)} />
            ))}
          </>
        );
      case 4:
        return (
          <>
            <AppText variant="h2" style={styles.q}>Biological sex</AppText>
            <AppText tone="secondary" style={{ marginBottom: 16 }}>
              Used only to tailor general advice. It's never shared.
            </AppText>
            {GENDER_OPTIONS.map((o) => (
              <OptionButton key={o.value} label={o.label} selected={gender === o.value} onPress={() => setGender(o.value)} />
            ))}
          </>
        );
      case 5:
        return (
          <>
            <AppText variant="h2" style={styles.q}>How old are you?</AppText>
            <AppText tone="secondary" style={{ marginBottom: 16 }}>Optional.</AppText>
            <TextField label="Age" value={age} onChangeText={(t) => setAge(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={3} error={error} />
          </>
        );
      default:
        return (
          <>
            <AppText variant="h2" style={styles.q}>What's your current weight?</AppText>
            <AppText tone="secondary" style={{ marginBottom: 16 }}>Optional — you can log weight any time in Progress.</AppText>
            <SegmentedControl<WeightUnit>
              value={unit}
              onChange={setUnit}
              options={[{ value: 'kg', label: 'kg' }, { value: 'lbs', label: 'lbs' }]}
              style={{ marginBottom: 16 }}
            />
            <TextField label={`Weight (${unit})`} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={error} />
          </>
        );
    }
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {step > 0 ? (
            <Button title="Back" variant="outline" onPress={() => setStep(step - 1)} style={{ flex: 1 }} />
          ) : null}
          <Button
            title={step === TOTAL_STEPS - 1 ? 'Continue to health check' : 'Next'}
            onPress={next}
            disabled={!optional && !canContinue[step]}
            loading={saving}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <View style={styles.topRow}>
        <AppText variant="label" tone="muted">
          Question {step + 1} of {TOTAL_STEPS + 1}
        </AppText>
        <Pressable onPress={skip} hitSlop={10} accessibilityRole="button">
          <AppText variant="bodyBold" tone="accent">Skip</AppText>
        </Pressable>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { width: `${((step + 1) / (TOTAL_STEPS + 1)) * 100}%`, backgroundColor: colors.accent }]} />
      </View>
      {step === 0 ? (
        <View style={[styles.intro, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
          <AppText variant="small" tone="secondary">
            Answer a few questions to get personalised recommendations — you can skip this anytime.
          </AppText>
        </View>
      ) : null}
      {renderStep()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  progressTrack: { height: 4, borderRadius: 2, marginTop: 12, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: 4 },
  intro: { padding: 14, borderWidth: 1, marginBottom: 20 },
  q: { marginBottom: 16 },
  daysRow: { flexDirection: 'row', gap: 10 },
  day: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
