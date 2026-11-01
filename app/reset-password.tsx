import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { createSessionFromUrl } from '@/services/auth';
import { supabase } from '@/services/supabase';
import { ROUTES } from '@/constants/routes';
import { errorMessage, validatePassword } from '@/utils/validation';

/** Opened from the password-reset email link (projectbuilt://reset-password?code=…). */
export default function ResetPassword() {
  const { colors } = useTheme();
  const url = Linking.useURL();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (url) await createSessionFromUrl(url);
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('This reset link is invalid or has expired. Please request a new one.');
        setReady(true);
      } catch (e) {
        setLinkError(errorMessage(e));
      }
    })();
  }, [url]);

  const submit = async () => {
    const v = validatePassword(password);
    if (v) return setError(v);
    if (password !== confirm) return setError('Passwords do not match.');
    setSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      Alert.alert('Password updated', 'Your password has been changed.');
      router.replace(ROUTES.home);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (linkError) {
    return (
      <Screen edges={[]}>
        <AppText variant="h3">Link expired</AppText>
        <AppText tone="secondary" style={{ marginVertical: 12 }}>
          {linkError}
        </AppText>
        <Button title="Request a new link" onPress={() => router.replace(ROUTES.forgotPassword)} />
      </Screen>
    );
  }
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accentText} />
      </View>
    );
  }
  return (
    <Screen edges={[]}>
      <AppText variant="h2" style={{ marginBottom: 8 }}>
        Choose a new password
      </AppText>
      <AppText tone="secondary" style={{ marginBottom: 20 }}>
        At least 8 characters, including a letter and a number.
      </AppText>
      <TextField label="New password" value={password} onChangeText={setPassword} secureToggle autoCapitalize="none" textContentType="newPassword" />
      <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} secureToggle autoCapitalize="none" error={error} />
      <Button title="Update password" onPress={submit} loading={saving} />
    </Screen>
  );
}
