// Supabase Edge Function: verify the caller's subscription directly with
// RevenueCat and record it on their profile.
//
// The app calls this straight after a purchase or restore. Premium is only
// unlocked when RevenueCat's servers (which validate the App Store / Google
// Play receipt) confirm an active entitlement — the app can't grant itself
// Premium. Works alongside the revenuecat-webhook function.
//
// Deploy:  supabase functions deploy sync-subscription
// Secrets: supabase secrets set REVENUECAT_SECRET_API_KEY="sk_..."   (RevenueCat → API keys → Secret key, v1)
//          SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

interface RCEntitlement {
  expires_date: string | null;
  product_identifier: string;
}
interface RCSubscription {
  period_type?: 'normal' | 'trial' | 'intro';
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Identify the caller from their Supabase session (never trust a user id in the body).
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return new Response('Unauthorized', { status: 401 });

  const secret = Deno.env.get('REVENUECAT_SECRET_API_KEY');
  if (!secret) return new Response('REVENUECAT_SECRET_API_KEY not configured', { status: 500 });
  const entitlementId = Deno.env.get('REVENUECAT_ENTITLEMENT') ?? 'premium';

  const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
  });
  if (!rcRes.ok) {
    console.error('RevenueCat lookup failed', rcRes.status, await rcRes.text());
    return new Response('Could not verify subscription', { status: 502 });
  }
  const body = await rcRes.json();
  const entitlement: RCEntitlement | undefined = body?.subscriber?.entitlements?.[entitlementId];
  const sub: RCSubscription | undefined = entitlement
    ? body?.subscriber?.subscriptions?.[entitlement.product_identifier]
    : undefined;

  const now = Date.now();
  const expiry = entitlement?.expires_date ?? null;
  const active = !!entitlement && (expiry === null || new Date(expiry).getTime() > now);

  let status: string;
  if (!entitlement) status = 'none';
  else if (!active) status = 'expired';
  else if (sub?.billing_issues_detected_at) status = 'billing_issue';
  else if (sub?.unsubscribe_detected_at) status = 'cancelled';
  else if (sub?.period_type === 'trial') status = 'trialing';
  else status = 'active';

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
  const { error } = await admin
    .from('profiles')
    .update({ subscription_status: status, subscription_expiry: expiry })
    .eq('id', user.id);
  if (error) {
    console.error('Profile update failed', error);
    return new Response('Database error', { status: 500 });
  }

  return Response.json({ isPremium: active, status, expiry });
});
