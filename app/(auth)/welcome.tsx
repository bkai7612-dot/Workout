import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Logo } from '@/components/Logo';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ROUTES } from '@/constants/routes';

export default function Welcome() {
  return (
    <Screen scroll={false} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Logo size={88} />
        <AppText variant="h3" tone="secondary" center style={{ marginTop: 12 }}>
          Build the best version of you.
        </AppText>
      </View>
      <View style={styles.actions}>
        <Button title="Get Started" onPress={() => router.push(ROUTES.signUp)} />
        <Button title="I already have an account" variant="outline" onPress={() => router.push(ROUTES.signIn)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: 12, paddingBottom: 12 },
});
