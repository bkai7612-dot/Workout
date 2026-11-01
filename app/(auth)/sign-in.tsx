import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import { supabase } from '@/services/supabase';
import { ROUTES } from '@/constants/routes';
import { errorMessage, validateEmail } from '@/utils/validation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) return setError(emailErr);
    if (!password) return setError('Enter your password.');
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
    } catch (e) {
      const msg = errorMessage(e);
      setError(msg.includes('Invalid login') ? 'Incorrect email or password.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <AppText variant="h1">Welcome back</AppText>
      <AppText tone="secondary" style={{ marginTop: 6, marginBottom: 24 }}>
        Sign in to pick up where you left off.
      </AppText>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureToggle
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        error={error}
        onSubmitEditing={submit}
      />
      <Pressable onPress={() => router.push(ROUTES.forgotPassword)} style={{ alignSelf: 'flex-end', marginBottom: 20 }} hitSlop={8}>
        <AppText variant="small" tone="accent" weight="700">
          Forgot password?
        </AppText>
      </Pressable>
      <Button title="Sign in" onPress={submit} loading={loading} />
      <SocialAuthButtons />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <AppText tone="secondary">New here? </AppText>
        <Pressable onPress={() => router.replace(ROUTES.signUp)} hitSlop={8}>
          <AppText tone="accent" weight="700">
            Create an account
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
