export { useAuthStore } from './authStore';
export { useProfileStore } from './profileStore';
export { useWorkoutStore } from './workoutStore';
export { useWeightStore } from './weightStore';
export { useSubscriptionStore } from './subscriptionStore';
export { useChatStore } from './chatStore';
export { useActiveWorkoutStore } from './activeWorkoutStore';
export { useThemeStore } from './themeStore';

import { useProfileStore } from './profileStore';
import { useWorkoutStore } from './workoutStore';
import { useWeightStore } from './weightStore';
import { useSubscriptionStore } from './subscriptionStore';
import { useChatStore } from './chatStore';
import { useActiveWorkoutStore } from './activeWorkoutStore';

/** Clears all user-scoped state (on sign out / account deletion). */
export async function resetUserStores() {
  useProfileStore.getState().reset();
  useWorkoutStore.getState().reset();
  useWeightStore.getState().reset();
  useChatStore.getState().reset();
  useActiveWorkoutStore.getState().discard();
  useActiveWorkoutStore.getState().clearFinished();
  await useSubscriptionStore.getState().reset();
}
