import { useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { findPreviousPerformance } from '@/utils/overload';
import { ROUTES } from '@/constants/routes';
import type { WorkoutSource } from '@/store/activeWorkoutStore';

/**
 * Starts a workout from a template (or an empty ad-hoc one). Enforces the PAR-Q
 * health screen before any workout is logged, and protects an in-progress session.
 */
export function useStartWorkout() {
  return useCallback((template: WorkoutSource | null) => {
    const profile = useProfileStore.getState().profile;
    const active = useActiveWorkoutStore.getState();

    if (!profile?.parq_completed) {
      Alert.alert(
        'Health check required',
        'Before logging any exercise, please complete the short PAR-Q health questionnaire. It takes under a minute.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Start PAR-Q', onPress: () => router.push({ pathname: ROUTES.parq, params: { from: 'workout' } }) },
        ],
      );
      return;
    }

    const begin = () => {
      const previous = template ? findPreviousPerformance(useWorkoutStore.getState().logs, template) : null;
      useActiveWorkoutStore.getState().start(template, profile.weight_unit, previous);
      router.push(ROUTES.activeWorkout);
    };

    if (active.active) {
      Alert.alert('Workout in progress', `You already have "${active.templateName}" running.`, [
        { text: 'Resume it', onPress: () => router.push(ROUTES.activeWorkout) },
        { text: 'Discard & start new', style: 'destructive', onPress: begin },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    begin();
  }, []);
}
