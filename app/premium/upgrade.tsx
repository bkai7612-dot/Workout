import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { PurchasesPackage } from 'react-native-purchases';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Banner } from '@/components/Banner';
import { useTheme } from '@/hooks/useTheme';
import { usePremium } from '@/hooks/usePremium';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { openManageSubscriptions } from '@/services/revenuecat';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/date';
import { errorMessage } from '@/utils/validation';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'infinite', title: 'Unlimited workout templates', body: 'Free plan is limited to 7.' },
  { icon: 'nutrition', title: 'Every nutrition tip unlocked', body: 'Diet breaks, carb timing, supplement deep-dives and more.' },
  { icon: 'chatbubbles', title: 'Chat with your coach', body: 'Send questions straight to a qualified PT.' },
];

export default function Upgrade() {
  const { colors, radius } = useTheme();
  const premium = usePremium();
  const { available, offering, loadOffering, purchase, restore } = useSubscriptionStore();
  const [loadingOffering, setLoadingOffering] = useState(true);
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  useEffect(() => {
    loadOffering().finally(() => setLoadingOffering(false));
  }, [loadOffering]);

  const packages = useMemo(() => {
    if (!offering) return [];
    return [offering.monthly, offering.annual].filter(Boolean) as PurchasesPackage[];
  }, [offering]);

  useEffect(() => {
    if (!selected && packages.length) setSelected(offering?.annual ?? packages[0]);
  }, [packages, offering, selected]);

  const hasTrial = !!selected?.product.introPrice && selected.product.introPrice.price === 0;

  const buy = async () => {
    if (!selected) return;
    setBusy('buy');
    try {
      const ok = await purchase(selected);
      if (ok) {
        Alert.alert('Welcome to Premium! ⚡', 'Everything is unlocked. Thanks for supporting ProjectBuilt.');
        router.back();
      }
    } catch (e) {
      Alert.alert('Purchase failed', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const doRestore = async () => {
    setBusy('restore');
    try {
      const ok = await restore();
      Alert.alert(ok ? 'Purchases restored' : 'Nothing to restore', ok ? 'Premium is active again.' : 'We could not find an active subscription for this store account.');
      if (ok) router.back();
    } catch (e) {
      Alert.alert('Restore failed', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (premium.isPremium) {
    return (
      <Screen edges={['bottom']}>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Ionicons name="flash" size={36} color={colors.onAccent} />
          </View>
          <AppText variant="h1" center style={{ marginTop: 16 }}>You're Premium</AppText>
          {premium.expiry ? (
            <AppText tone="secondary" center style={{ marginTop: 6 }}>
              {premium.willRenew ? 'Renews' : 'Expires'} {formatDate(premium.expiry)}
            </AppText>
          ) : null}
        </View>
        <Button title="Chat with your coach" icon="chatbubbles-outline" onPress={() => router.replace(ROUTES.chat)} style={{ marginTop: 32 }} />
        <Button title="Manage Subscription" variant="outline" onPress={() => openManageSubscriptions(premium.managementURL)} style={{ marginTop: 10 }} />
      </Screen>
    );
  }

  const fallbackPlans = [
    { id: 'annual', title: 'Yearly', price: '£14.99/year', note: 'Save ~37% · £1.25/month' },
    { id: 'monthly', title: 'Monthly', price: '£1.99/month', note: 'Cancel anytime' },
  ];

  return (
    <Screen edges={['bottom']}>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Ionicons name="flash" size={36} color={colors.onAccent} />
        </View>
        <AppText variant="h1" center style={{ marginTop: 16 }}>
          ProjectBuilt Premium
        </AppText>
        <AppText tone="secondary" center style={{ marginTop: 6 }}>
          7-day free trial for new members. Then from £1.99/month.
        </AppText>
      </View>

      <Card style={{ marginTop: 24 }}>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefit}>
            <Ionicons name={b.icon} size={22} color={colors.accentText} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">{b.title}</AppText>
              <AppText variant="small" tone="secondary">{b.body}</AppText>
            </View>
          </View>
        ))}
      </Card>

      {loadingOffering ? (
        <ActivityIndicator color={colors.accentText} style={{ marginVertical: 24 }} />
      ) : packages.length ? (
        packages.map((p) => {
          const isSel = selected?.identifier === p.identifier;
          const annual = p.packageType === 'ANNUAL';
          return (
            <Pressable
              key={p.identifier}
              onPress={() => setSelected(p)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSel }}
              style={[styles.plan, { borderRadius: radius.lg, borderColor: isSel ? colors.accentText : colors.border, backgroundColor: colors.surface }]}
            >
              <Ionicons name={isSel ? 'radio-button-on' : 'radio-button-off'} size={22} color={isSel ? colors.accentText : colors.textMuted} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">{annual ? 'Yearly' : 'Monthly'}</AppText>
                <AppText variant="caption" tone="muted">
                  {annual ? 'Best value — save ~37%' : 'Cancel anytime'}
                  {p.product.introPrice?.price === 0 ? ' · 7-day free trial' : ''}
                </AppText>
              </View>
              <AppText variant="bodyBold">
                {p.product.priceString}/{annual ? 'yr' : 'mo'}
              </AppText>
            </Pressable>
          );
        })
      ) : (
        <>
          {fallbackPlans.map((p) => (
            <View key={p.id} style={[styles.plan, { borderRadius: radius.lg, borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyBold">{p.title}</AppText>
                <AppText variant="caption" tone="muted">{p.note}</AppText>
              </View>
              <AppText variant="bodyBold">{p.price}</AppText>
            </View>
          ))}
          <Banner
            tone="warning"
            message={
              available
                ? 'Subscriptions could not be loaded from the store. Please check your connection and try again.'
                : 'In-app purchases need a development or production build (they are not available in Expo Go) and RevenueCat API keys in your .env.'
            }
          />
        </>
      )}

      <Button
        title={hasTrial ? 'Start 7-day free trial' : 'Subscribe'}
        onPress={buy}
        loading={busy === 'buy'}
        disabled={!selected || busy != null}
        style={{ marginTop: 8 }}
      />
      <Button title="Restore purchases" variant="ghost" onPress={doRestore} loading={busy === 'restore'} disabled={!available || busy != null} style={{ marginTop: 6 }} />

      <AppText variant="caption" tone="muted" center style={{ marginTop: 12, lineHeight: 17 }}>
        {hasTrial ? 'After the free trial, your ' : 'Your '}subscription renews automatically at the price shown unless cancelled at least 24 hours before the end of the current period. Payment is charged to your App Store / Google Play account. Manage or cancel anytime in your store account settings.
      </AppText>
      <View style={styles.links}>
        <AppText variant="caption" tone="accent" weight="700" onPress={() => router.push(ROUTES.terms)}>Terms & Conditions</AppText>
        <AppText variant="caption" tone="muted">  ·  </AppText>
        <AppText variant="caption" tone="accent" weight="700" onPress={() => router.push(ROUTES.privacy)}>Privacy Policy</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  plan: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, marginBottom: 10 },
  links: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
});
