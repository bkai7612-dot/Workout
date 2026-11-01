import { useProfileStore } from '@/store/profileStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

/**
 * Premium if RevenueCat reports an active entitlement on this device, or the
 * server-side profile (updated by the RevenueCat webhook) says so.
 */
export function usePremium() {
  const rc = useSubscriptionStore();
  const profile = useProfileStore((s) => s.profile);
  // Mirrors public.is_premium() in the database: cancelled / billing-issue
  // subscriptions keep access until their expiry date.
  const status = profile?.subscription_status ?? 'none';
  const expiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const serverActive =
    ['active', 'trialing', 'cancelled', 'billing_issue'].includes(status) &&
    (expiry ? expiry > new Date() : status === 'active' || status === 'trialing');
  const isPremium = rc.isPremium || serverActive;
  return {
    isPremium,
    expiry: rc.expirationDate ?? profile?.subscription_expiry ?? null,
    willRenew: rc.isPremium ? rc.willRenew : profile?.subscription_status === 'active',
    isTrial: rc.isTrial || profile?.subscription_status === 'trialing',
    managementURL: rc.managementURL,
  };
}
