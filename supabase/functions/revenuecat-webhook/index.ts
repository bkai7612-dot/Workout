// Supabase Edge Function: RevenueCat → Supabase subscription sync.
//
// RevenueCat calls this webhook on every subscription event. We update
// profiles.subscription_status / subscription_expiry with the service role,
// which is the only role allowed to change those columns (see migrations).
// This is what unlocks Premium server-side (chat + unlimited templates).
//
// Deploy:  supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secrets: supabase secrets set REVENUECAT_WEBHOOK_AUTH="Bearer <long-random-string>"
//          (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically)

import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Status = 'active' | 'trialing' | 'cancelled' | 'expired' | 'billing_issue';

interface RCEvent {
  type: string;
  app_user_id: string;
  original_app_user_id?: string;
  aliases?: string[];
  transferred_to?: string[];
  transferred_from?: string[];
  period_type?: 'TRIAL' | 'INTRO' | 'NORMAL' | 'PROMOTIONAL';
  expiration_at_ms?: number | null;
  entitlement_ids?: string[] | null;
}

function statusFor(event: RCEvent): Status | null {
  const trial = event.period_type === 'TRIAL';
  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
    case 'SUBSCRIPTION_EXTENDED':
    case 'TEMPORARY_ENTITLEMENT_GRANT':
      return trial ? 'trialing' : 'active';
    case 'CANCELLATION':
      return 'cancelled'; // keeps access until expiry
    case 'BILLING_ISSUE':
      return 'billing_issue'; // grace period until expiry
    case 'EXPIRATION':
      return 'expired';
    default:
      return null; // TEST, SUBSCRIPTION_PAUSED, etc. — ignore
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (!expected || req.headers.get('Authorization') !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  let event: RCEvent;
  try {
    ({ event } = await req.json());
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const entitlement = Deno.env.get('REVENUECAT_ENTITLEMENT') ?? 'premium';
  if (event.entitlement_ids && !event.entitlement_ids.includes(entitlement)) {
    return Response.json({ ignored: 'different entitlement' });
  }

  // Ownership moved to another account (e.g. "Restore purchases" on a new login).
  if (event.type === 'TRANSFER') {
    const from = (event.transferred_from ?? []).filter((id) => UUID_RE.test(id));
    const to = (event.transferred_to ?? []).filter((id) => UUID_RE.test(id));
    if (from.length) {
      await supabase.from('profiles').update({ subscription_status: 'none', subscription_expiry: null }).in('id', from);
    }
    // The receiving user gets a fresh event / their app syncs, but mark active now.
    if (to.length) {
      await supabase.from('profiles').update({ subscription_status: 'active' }).in('id', to);
    }
    return Response.json({ ok: true });
  }

  const status = statusFor(event);
  if (!status) return Response.json({ ignored: event.type });

  // App user IDs are Supabase user UUIDs (configured in the app); skip anonymous IDs.
  const candidates = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])].filter(
    (id): id is string => !!id && UUID_RE.test(id),
  );
  const userId = candidates[0];
  if (!userId) return Response.json({ ignored: 'anonymous user' });

  const expiry = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: status, subscription_expiry: expiry })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile', error);
    return new Response('Database error', { status: 500 }); // RevenueCat will retry
  }
  return Response.json({ ok: true, userId, status, expiry });
});
