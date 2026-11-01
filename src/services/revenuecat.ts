import { Linking, Platform } from 'react-native';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

/**
 * Thin wrapper around react-native-purchases (RevenueCat).
 *
 * RevenueCat's native module is not available in Expo Go, so everything is
 * loaded lazily and fails soft: the app keeps working on the Free plan and the
 * upgrade screen explains that purchases need a development/production build.
 */

export const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium';

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

type PurchasesModule = typeof import('react-native-purchases').default;

let Purchases: PurchasesModule | null = null;
let configured = false;

function loadModule(): PurchasesModule | null {
  if (Purchases) return Purchases;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Purchases = require('react-native-purchases').default as PurchasesModule;
  } catch {
    Purchases = null;
  }
  return Purchases;
}

export function isRevenueCatAvailable() {
  return configured;
}

export interface PremiumState {
  isPremium: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  isTrial: boolean;
  managementURL: string | null;
}

export function premiumStateFromCustomerInfo(info: CustomerInfo | null): PremiumState {
  const ent = info?.entitlements.active[ENTITLEMENT_ID];
  return {
    isPremium: Boolean(ent),
    expirationDate: ent?.expirationDate ?? null,
    willRenew: ent?.willRenew ?? false,
    isTrial: ent?.periodType === 'TRIAL',
    managementURL: info?.managementURL ?? null,
  };
}

/** Configure RevenueCat with the Supabase user id as the app user id. */
export async function configureRevenueCat(appUserId: string): Promise<boolean> {
  const mod = loadModule();
  if (!mod || !apiKey) return false;
  try {
    if (!configured) {
      mod.configure({ apiKey, appUserID: appUserId });
      configured = true;
    } else {
      await mod.logIn(appUserId);
    }
    return true;
  } catch (e) {
    console.warn('[RevenueCat] configure failed', e);
    configured = false;
    return false;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured || !Purchases) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export function addCustomerInfoListener(cb: (info: CustomerInfo) => void): () => void {
  if (!configured || !Purchases) return () => {};
  Purchases.addCustomerInfoUpdateListener(cb);
  return () => Purchases?.removeCustomerInfoUpdateListener(cb);
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured || !Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.warn('[RevenueCat] getOfferings failed', e);
    return null;
  }
}

/** Returns updated CustomerInfo, or null if the user cancelled. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!configured || !Purchases) throw new Error('Purchases are unavailable in this build.');
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'userCancelled' in e && (e as { userCancelled: boolean }).userCancelled) {
      return null;
    }
    throw e;
  }
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!configured || !Purchases) throw new Error('Purchases are unavailable in this build.');
  return Purchases.restorePurchases();
}

export async function logOutRevenueCat() {
  if (!configured || !Purchases) return;
  try {
    const anonymous = await Purchases.isAnonymous();
    if (!anonymous) await Purchases.logOut();
  } catch {
    // ignore
  }
}

/** Opens the platform's subscription management UI. */
export async function openManageSubscriptions(managementURL?: string | null) {
  if (configured && Purchases && Platform.OS === 'ios') {
    try {
      await Purchases.showManageSubscriptions();
      return;
    } catch {
      // fall through to URL
    }
  }
  const fallback =
    managementURL ||
    (Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions');
  await Linking.openURL(fallback);
}
