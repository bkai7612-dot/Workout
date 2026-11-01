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
import type { Profile } from '@/types';
import { useProfileStore } from './profileStore';

/**
 * Result of a purchase / restore:
 * - confirmed:  payment verified server-side, Premium unlocked
 * - confirming: the store says it's paid but our server hasn't verified it yet
 * - pending:    the store hasn't taken payment yet (Ask to Buy, pending card…)
 * - cancelled / not_found
 */
export type PurchaseResult = 'confirmed' | 'confirming' | 'pending' | 'cancelled' | 'not_found';

interface SubscriptionState extends PremiumState {
  available: boolean;
  offering: PurchasesOffering | null;
  /** The store reports an entitlement our server hasn't confirmed yet. */
  awaitingConfirmation: boolean;
  init: (userId: string) => Promise<void>;
  loadOffering: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  confirmWithServer: () => Promise<boolean>;
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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Same rule as public.is_premium() in the database. */
export function profileHasPremium(p: Pick<Profile, 'subscription_status' | 'subscription_expiry'> | null | undefined) {
  if (!p) return false;
  const expiry = p.subscription_expiry ? new Date(p.subscription_expiry) : null;
  const status = p.subscription_status;
  return (
    ['active', 'trialing', 'cancelled', 'billing_issue'].includes(status) &&
    (expiry ? expiry > new Date() : status === 'active' || status === 'trialing')
  );
}

async function refreshProfileSubscription(): Promise<boolean> {
  const profile = useProfileStore.getState().profile;
  if (!profile) return false;
  const { data } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expiry')
    .eq('id', profile.id)
    .maybeSingle();
  if (data) {
    const latest = useProfileStore.getState().profile ?? profile;
    useProfileStore.setState({ profile: { ...latest, ...data } });
  }
  return profileHasPremium(data as Profile | null);
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  ...EMPTY,
  available: false,
  offering: null,
  awaitingConfirmation: false,

  init: async (userId) => {
    const ok = await configureRevenueCat(userId);
    set({ available: ok });
    if (!ok) return;
    const info = await getCustomerInfo();
    set(premiumStateFromCustomerInfo(info));
    removeListener?.();
    removeListener = addCustomerInfoListener((i) => {
      set(premiumStateFromCustomerInfo(i));
      get().confirmWithServer().catch(() => {});
    });
    // The store has a subscription the server doesn't know about yet (e.g. webhook delay): verify it.
    if (get().isPremium && !profileHasPremium(useProfileStore.getState().profile)) {
      get().confirmWithServer().catch(() => {});
    }
  },

  loadOffering: async () => {
    if (!isRevenueCatAvailable()) return;
    set({ offering: await getCurrentOffering() });
  },

  /**
   * Asks our server to verify the subscription directly with RevenueCat and
   * record it. Premium (unlimited templates, locked tips, chat) only unlocks
   * once the server has confirmed payment.
   */
  confirmWithServer: async () => {
    set({ awaitingConfirmation: true });
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await supabase.functions.invoke('sync-subscription', { body: {} });
        } catch {
          // fall back to the webhook having updated the profile
        }
        if (await refreshProfileSubscription()) {
          set({ awaitingConfirmation: false });
          return true;
        }
        await wait(1500 * (attempt + 1));
      }
      set({ awaitingConfirmation: get().isPremium });
      return false;
    } catch {
      set({ awaitingConfirmation: get().isPremium });
      return false;
    }
  },

  purchase: async (pkg) => {
    const outcome = await purchasePackage(pkg);
    if (outcome.kind === 'cancelled') return 'cancelled';
    if (outcome.kind === 'pending') return 'pending';
    const state = premiumStateFromCustomerInfo(outcome.customerInfo);
    set(state);
    if (!state.isPremium) return 'pending';
    return (await get().confirmWithServer()) ? 'confirmed' : 'confirming';
  },

  restore: async () => {
    const info = await restorePurchases();
    const state = premiumStateFromCustomerInfo(info);
    set(state);
    if (!state.isPremium) return 'not_found';
    return (await get().confirmWithServer()) ? 'confirmed' : 'confirming';
  },

  reset: async () => {
    removeListener?.();
    removeListener = null;
    await logOutRevenueCat();
    set({ ...EMPTY, offering: null, awaitingConfirmation: false });
  },
}));
