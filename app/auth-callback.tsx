import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { createSessionFromUrl } from '@/services/auth';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/utils/validation';

/** Deep-link target for OAuth and email-confirmation redirects. */
export default function AuthCallback() {
  const { colors } = useTheme();
  const url = Linking.useURL();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) await createSessionFromUrl(url);
        // The root layout's auth gate routes onwards once the session exists.
      } catch (e) {
        setError(errorMessage(e));
      }
    })();
  }, [url]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
      {error ? (
        <>
          <AppText variant="h3" center>
            Couldn't sign you in
          </AppText>
          <AppText tone="secondary" center style={{ marginVertical: 12 }}>
            {error}
          </AppText>
          <Button title="Back to sign in" onPress={() => router.replace(ROUTES.signIn)} />
        </>
      ) : (
        <ActivityIndicator color={colors.accentText} />
      )}
    </View>
  );
}
