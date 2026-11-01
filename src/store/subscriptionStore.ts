import { create } from 'zustand';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  addCustomerInfoListener,
  configureRevenueCat,
  getCurrentOffering,
  getCustomerInfo,
  isRevenueCatAvailable,
  logOutRevenueCat,
  premiumStateFromCustomerInfo,
  purchasePackage,
  restorePurchases,
  type PremiumState,
} from '@/services/revenuecat';
import { supabase } from '@/services/supabase';
import { useProfileStore } from './profileStore';

interface SubscriptionState extends PremiumState {
  available: boolean;
  offering: PurchasesOffering | null;
  init: (userId: string) => Promise<void>;
  loadOffering: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  reset: () => Promise<void>;
}

const EMPTY: PremiumState = {
  isPremium: false,
  expirationDate: null,
  willRenew: false,
  isTrial: false,
  managementURL: null,
};

let removeListener: (() => void) | null = null;

/** Re-reads the profile so server-side subscription fields (set by the RevenueCat webhook) are fresh. */
async function refreshProfileSubscription() {
  const profile = useProfileStore.getState().profile;
  if (!profile) return;
  const { data } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expiry')
    .eq('id', profile.id)
    .maybeSingle();
  if (data) {
    useProfileStore.setState({ profile: { ...profile, ...data } });
  }
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  ...EMPTY,
  available: false,
  offering: null,

  init: async (userId) => {
    const ok = await configureRevenueCat(userId);
    set({ available: ok });
    if (!ok) return;
    const info = await getCustomerInfo();
    set(premiumStateFromCustomerInfo(info));
    removeListener?.();
    removeListener = addCustomerInfoListener((i) => {
      set(premiumStateFromCustomerInfo(i));
      // Give the webhook a moment to update Supabase, then refresh.
      setTimeout(refreshProfileSubscription, 4000);
    });
  },

  loadOffering: async () => {
    if (!isRevenueCatAvailable()) return;
    set({ offering: await getCurrentOffering() });
  },

  purchase: async (pkg) => {
    const info = await purchasePackage(pkg);
    if (!info) return false;
    const state = premiumStateFromCustomerInfo(info);
    set(state);
    setTimeout(refreshProfileSubscription, 4000);
    return state.isPremium;
  },

  restore: async () => {
    const info = await restorePurchases();
    const state = premiumStateFromCustomerInfo(info);
    set(state);
    setTimeout(refreshProfileSubscription, 4000);
    return state.isPremium;
  },

  reset: async () => {
    removeListener?.();
    removeListener = null;
    await logOutRevenueCat();
    set({ ...EMPTY, offering: null });
  },
}));
