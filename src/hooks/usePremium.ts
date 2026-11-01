import { useProfileStore } from '@/store/profileStore';
import { profileHasPremium, useSubscriptionStore } from '@/store/subscriptionStore';

/**
 * Premium is only granted once payment has been confirmed server-side
 * (RevenueCat → Supabase, via the webhook or the sync-subscription function).
 * The same check (public.is_premium) gates chat and template limits in the
 * database, so the app and server always agree.
 */
export function usePremium() {
  const rc = useSubscriptionStore();
  const profile = useProfileStore((s) => s.profile);
  const isPremium = profileHasPremium(profile);
  return {
    isPremium,
    /** Store says paid, server verification still in progress. */
    awaitingConfirmation: !isPremium && (rc.awaitingConfirmation || rc.isPremium),
    expiry: profile?.subscription_expiry ?? rc.expirationDate ?? null,
    willRenew: profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing',
    isTrial: profile?.subscription_status === 'trialing' || rc.isTrial,
    managementURL: rc.managementURL,
  };
}
