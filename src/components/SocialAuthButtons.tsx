import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '@/hooks/useTheme';
import { signInWithApple, signInWithGoogle } from '@/services/auth';
import { errorMessage } from '@/utils/validation';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  /** Called before starting; return false to block (e.g. GDPR consent not given). */
  beforeStart?: () => boolean;
}

export function SocialAuthButtons({ beforeStart }: Props) {
  const theme = useTheme();
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  const run = async (provider: 'apple' | 'google') => {
    if (beforeStart && !beforeStart()) return;
    setBusy(provider);
    try {
      if (provider === 'apple') await signInWithApple();
      else await signInWithGoogle();
      // Navigation happens automatically via the auth listener in the root layout.
    } catch (e) {
      Alert.alert('Sign in failed', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        <AppText variant="caption" tone="muted" style={{ marginHorizontal: 12 }}>
          or continue with
        </AppText>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>
      {Platform.OS === 'ios' ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={
            theme.dark
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={theme.radius.md}
          style={styles.apple}
          onPress={() => run('apple')}
        />
      ) : (
        <Button
          title="Continue with Apple"
          icon="logo-apple"
          variant="outline"
          loading={busy === 'apple'}
          onPress={() => run('apple')}
          style={{ marginBottom: 10 }}
        />
      )}
      <Button
        title="Continue with Google"
        icon="logo-google"
        variant="outline"
        loading={busy === 'google'}
        onPress={() => run('google')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  apple: { width: '100%', height: 52, marginBottom: 10 },
});
