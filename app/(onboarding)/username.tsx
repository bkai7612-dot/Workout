import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { ROUTES } from '@/constants/routes';
import { errorMessage, validateUsername } from '@/utils/validation';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export default function Username() {
  const { colors } = useTheme();
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const { createProfile, isUsernameAvailable } = useProfileStore();
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<Availability>('idle');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatError = username ? validateUsername(username) : null;

  useEffect(() => {
    if (!username || formatError) {
      setAvailability('idle');
      return;
    }
    setAvailability('checking');
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const ok = await isUsernameAvailable(username);
        if (!cancelled) setAvailability(ok ? 'available' : 'taken');
      } catch {
        if (!cancelled) setAvailability('error');
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [username, formatError, isUsernameAvailable]);

  const submit = async () => {
    const v = validateUsername(username);
    if (v) return setError(v);
    if (availability === 'taken') return setError('That username is already taken.');
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await createProfile(session.user.id, username);
      router.replace(ROUTES.questionnaire);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const statusIcon =
    availability === 'checking' ? (
      <ActivityIndicator size="small" color={colors.textMuted} />
    ) : availability === 'available' ? (
      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
    ) : availability === 'taken' ? (
      <Ionicons name="close-circle" size={20} color={colors.danger} />
    ) : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <AppText variant="label" tone="accent" style={{ marginTop: 24 }}>
        Step 1
      </AppText>
      <AppText variant="h1" style={{ marginTop: 6 }}>
        Choose a username
      </AppText>
      <AppText tone="secondary" style={{ marginTop: 6, marginBottom: 24 }}>
        This is how we'll greet you. 3–20 characters: letters, numbers and underscores.
      </AppText>
      <TextField
        label="Username"
        value={username}
        onChangeText={(t) => {
          setUsername(t.replace(/\s/g, ''));
          setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        right={statusIcon}
        error={error ?? formatError ?? (availability === 'taken' ? 'That username is already taken.' : null)}
        hint={availability === 'available' ? 'Nice — that one is available.' : undefined}
        onSubmitEditing={submit}
      />
      <Button
        title="Continue"
        onPress={submit}
        loading={saving}
        disabled={!username || !!formatError || availability === 'taken' || availability === 'checking'}
      />
      <Pressable onPress={signOut} style={{ alignSelf: 'center', marginTop: 24 }} hitSlop={8}>
        <AppText variant="small" tone="muted">
          Sign out
        </AppText>
      </Pressable>
    </Screen>
  );
}
