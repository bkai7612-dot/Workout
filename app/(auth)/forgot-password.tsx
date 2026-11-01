import React, { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { sendPasswordReset } from '@/services/auth';
import { errorMessage, validateEmail } from '@/utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const err = validateEmail(email);
    if (err) return setError(err);
    setError(null);
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <AppText variant="h1">Reset password</AppText>
      {sent ? (
        <>
          <AppText tone="secondary" style={{ marginTop: 10, marginBottom: 24 }}>
            If an account exists for {email.trim()}, you'll receive an email with a link to reset your password. Open it on
            this device.
          </AppText>
          <Button title="Back to sign in" onPress={() => router.back()} />
        </>
      ) : (
        <>
          <AppText tone="secondary" style={{ marginTop: 6, marginBottom: 24 }}>
            Enter the email you signed up with and we'll send you a reset link.
          </AppText>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            error={error}
            onSubmitEditing={submit}
          />
          <Button title="Send reset link" onPress={submit} loading={loading} />
        </>
      )}
    </Screen>
  );
}
