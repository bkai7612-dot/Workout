import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import { supabase } from '@/services/supabase';
import { authRedirectUri } from '@/services/auth';
import { ROUTES } from '@/constants/routes';
import { errorMessage, validateEmail, validatePassword } from '@/utils/validation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false); // GDPR: never pre-ticked
  const [errors, setErrors] = useState<{ email?: string; password?: string; consent?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const requireConsent = () => {
    if (!consent) {
      setErrors((e) => ({ ...e, consent: 'Please accept the Privacy Policy and Terms to continue.' }));
      return false;
    }
    return true;
  };

  const submit = async () => {
    const next: typeof errors = {};
    next.email = validateEmail(email) ?? undefined;
    next.password = validatePassword(password) ?? undefined;
    if (!consent) next.consent = 'Please accept the Privacy Policy and Terms to continue.';
    setErrors(next);
    if (next.email || next.password || next.consent) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: authRedirectUri,
          data: { privacy_consent_at: new Date().toISOString() },
        },
      });
      if (error) throw error;
      if (!data.session) {
        // Email confirmation is enabled in Supabase.
        setSentTo(email.trim());
      }
      // Otherwise the auth gate routes to username selection.
    } catch (e) {
      setErrors({ form: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <Screen edges={['bottom']}>
        <AppText variant="h1">Check your inbox</AppText>
        <AppText tone="secondary" style={{ marginTop: 10, marginBottom: 24 }}>
          We've sent a confirmation link to {sentTo}. Open it on this device to finish creating your account.
        </AppText>
        <Button title="Back to sign in" onPress={() => router.replace(ROUTES.signIn)} />
        <Button
          title="Resend email"
          variant="ghost"
          style={{ marginTop: 8 }}
          onPress={async () => {
            const { error } = await supabase.auth.resend({ type: 'signup', email: sentTo, options: { emailRedirectTo: authRedirectUri } });
            Alert.alert(error ? 'Could not resend' : 'Email sent', error ? error.message : 'Check your inbox again.');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <AppText variant="h1">Create your account</AppText>
      <AppText tone="secondary" style={{ marginTop: 6, marginBottom: 24 }}>
        Start building the best version of you.
      </AppText>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureToggle
        autoCapitalize="none"
        textContentType="newPassword"
        hint="At least 8 characters, including a letter and a number."
        error={errors.password}
      />
      <View style={{ marginVertical: 8 }}>
        <Checkbox
          checked={consent}
          onChange={(v) => {
            setConsent(v);
            if (v) setErrors((e) => ({ ...e, consent: undefined }));
          }}
          accessibilityLabel="I agree to the Privacy Policy and Terms and Conditions"
        >
          <AppText variant="small" tone="secondary">
            I have read and agree to the{' '}
            <AppText variant="small" tone="accent" weight="700" onPress={() => router.push(ROUTES.privacy)}>
              Privacy Policy
            </AppText>{' '}
            and{' '}
            <AppText variant="small" tone="accent" weight="700" onPress={() => router.push(ROUTES.terms)}>
              Terms & Conditions
            </AppText>
            , and consent to ProjectBuilt processing the health and fitness data I choose to provide.
          </AppText>
        </Checkbox>
        {errors.consent ? (
          <AppText variant="caption" tone="danger" style={{ marginTop: 6 }}>
            {errors.consent}
          </AppText>
        ) : null}
      </View>
      {errors.form ? (
        <AppText variant="small" tone="danger" style={{ marginVertical: 8 }}>
          {errors.form}
        </AppText>
      ) : null}
      <Button title="Create account" onPress={submit} loading={loading} style={{ marginTop: 12 }} />
      <SocialAuthButtons beforeStart={requireConsent} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <AppText tone="secondary">Already a member? </AppText>
        <Pressable onPress={() => router.replace(ROUTES.signIn)} hitSlop={8}>
          <AppText tone="accent" weight="700">
            Sign in
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
