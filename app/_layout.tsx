import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useThemeStore } from '@/store/themeStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { useWeightStore } from '@/store/weightStore';
import { resetUserStores } from '@/store';
import { ROUTES } from '@/constants/routes';

/** Routes reachable without being signed in. */
const PUBLIC_ROOTS = new Set(['(auth)', 'legal', 'reset-password', 'auth-callback']);

function useAuthGate() {
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const profile = useProfileStore((s) => s.profile);
  const profileLoaded = useProfileStore((s) => s.loaded);

  useEffect(() => {
    if (!initialized) return;
    const root = segments[0] as string | undefined;

    if (!session) {
      if (!root || !PUBLIC_ROOTS.has(root)) router.replace(ROUTES.welcome);
      return;
    }
    if (!profileLoaded) return;

    if (!profile) {
      if (!(root === '(onboarding)' && segments[1] === 'username') && root !== 'legal') {
        router.replace(ROUTES.username);
      }
      return;
    }
    if (root === '(auth)' || root === 'auth-callback') {
      router.replace(ROUTES.home);
    }
  }, [initialized, session, profile, profileLoaded, segments]);
}

function useUserBootstrap() {
  const userId = useAuthStore((s) => s.session?.user.id);
  useEffect(() => {
    if (!userId) {
      resetUserStores();
      return;
    }
    useProfileStore
      .getState()
      .fetchProfile(userId)
      .catch((e) => {
        console.warn('Failed to load profile', e);
        useProfileStore.setState({ loaded: true });
      });
    useWorkoutStore.getState().fetchTemplates().catch(() => {});
    useWorkoutStore.getState().fetchLogs().catch(() => {});
    useWeightStore.getState().fetchEntries().catch(() => {});
    useSubscriptionStore.getState().init(userId).catch(() => {});
  }, [userId]);
}

export default function RootLayout() {
  const theme = useTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const themeHydrated = useThemeStore((s) => s.hydrated);

  useEffect(() => {
    useThemeStore.getState().hydrate();
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  useAuthGate();
  useUserBootstrap();

  const headerOptions = {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.text,
    headerTitleStyle: { fontWeight: '700' as const, color: theme.colors.text },
    headerShadowVisible: false,
    headerBackTitle: 'Back',
    contentStyle: { backgroundColor: theme.colors.background },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {!initialized || !themeHydrated ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
          <ActivityIndicator color={theme.colors.accentText} />
        </View>
      ) : (
        <Stack screenOptions={headerOptions}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="workouts/new-template" options={{ title: 'New template' }} />
          <Stack.Screen name="workouts/quick" options={{ title: 'Quick workout' }} />
          <Stack.Screen name="workouts/[id]" options={{ title: 'Edit template' }} />
          <Stack.Screen name="workouts/active" options={{ title: 'Workout', gestureEnabled: false }} />
          <Stack.Screen name="workouts/complete" options={{ title: 'Workout complete', headerBackVisible: false, gestureEnabled: false }} />
          <Stack.Screen name="progress/weight-log" options={{ title: 'Log weight' }} />
          <Stack.Screen name="progress/history" options={{ title: 'Workout history' }} />
          <Stack.Screen name="progress/log/[id]" options={{ title: 'Workout details' }} />
          <Stack.Screen name="premium/upgrade" options={{ title: 'Premium', presentation: 'modal' }} />
          <Stack.Screen name="premium/chat" options={{ title: 'Chat with Coach' }} />
          <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
          <Stack.Screen name="legal/privacy" options={{ title: 'Privacy Policy' }} />
          <Stack.Screen name="legal/terms" options={{ title: 'Terms & Conditions' }} />
          <Stack.Screen name="reset-password" options={{ title: 'Reset password' }} />
          <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
        </Stack>
      )}
    </SafeAreaProvider>
  );
}
