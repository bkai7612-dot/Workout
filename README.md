# ProjectBuilt

> **Build the best version of you.**

ProjectBuilt is a cross-platform (iOS + Android) fitness tracking app built with **React Native + Expo (SDK 51)**, **Expo Router**, **Supabase**, **Zustand** and **RevenueCat**.

- Workout templates (7 free, unlimited with Premium) built from a library of **98 exercises**
- Quick workouts: pick the muscles you want to train and get a generated workout, or choose from pre-made ones
- Set-by-set workout logging with an auto-starting rest timer, notes, a summary and a rating
- Body-weight tracking with a chart (1W / 1M / 3M / All), a body map of the muscles you've worked, and workout history
- Pre-written nutrition coaching, with some tips locked behind Premium
- A Sunday weekly review card on the Home screen (free for everyone, can be switched off)
- Premium "Chat with your coach" with a legal disclaimer
- UK GDPR features: a consent checkbox at sign-up, PAR-Q health screening, in-app account deletion and an ICO notice
- Full dark mode (the default) and light mode, following the device setting unless the user picks one

---

## Contents

1. [Project structure](#project-structure)
2. [Setup](#setup)
3. [Environment variables](#environment-variables)
4. [Supabase setup](#supabase-setup)
5. [Sign in with Apple & Google](#sign-in-with-apple--google)
6. [RevenueCat & subscriptions](#revenuecat--subscriptions)
7. [Replying to Premium chat messages (admin)](#replying-to-premium-chat-messages-admin)
8. [App Store / Google Play submission checklist](#app-store--google-play-submission-checklist)
9. [ICO registration reminder](#ico-registration-reminder)
10. [How it works (architecture notes)](#how-it-works-architecture-notes)

---

## Project structure

```
app/                          Expo Router (file-based routes)
  _layout.tsx                 Root stack, theme, auth gate & data bootstrap
  (auth)/                     welcome, sign-in, sign-up, forgot-password
  (onboarding)/               username, questionnaire (skippable), parq
  (tabs)/                     index (Home), workouts, progress, nutrition, profile
  workouts/                   new-template, [id] (edit), active, complete
  progress/                   weight-log, history, log/[id] (workout detail)
  premium/                    upgrade, chat
  settings/index.tsx          Settings
  legal/                      privacy, terms
  reset-password.tsx          Deep link target for password-reset emails
  auth-callback.tsx           Deep link target for OAuth / email confirmation
src/
  components/                 Reusable UI (Button, Card, BodyMap, LineChart, RestTimer, …)
  constants/                  theme.ts, routes.ts
  data/                       exercises.ts (98), nutrition.ts, sunday-advice.ts, parq.ts, legal.ts, …
  hooks/                      useTheme, usePremium, useUnit, useStartWorkout
  services/                   supabase.ts, auth.ts, revenuecat.ts, secureStorage.ts
  store/                      Zustand stores (auth, profile, workout, activeWorkout, weight, subscription, chat, theme)
  types/                      TypeScript interfaces
  utils/                      weight conversion, dates, workout maths, validation
supabase/
  migrations/                 SQL schema, functions/triggers, RLS, realtime + admin helpers
  functions/revenuecat-webhook/   Edge Function that syncs subscription status into Supabase
```

---

## Setup

**Requirements:** Node 18+, an Expo account, Xcode (for iOS) and/or Android Studio (for Android), plus a Supabase project and a RevenueCat project.

```bash
npm install
```

```bash
cp .env.example .env
```

Fill in `.env` (see the next section), then apply the database migrations (see [Supabase setup](#supabase-setup)).

### Running the app

Apple/Google sign-in and in-app purchases need native code, so **use a development build, not Expo Go**:

```bash
npx expo run:ios
```

```bash
npx expo run:android
```

Or build with EAS:

```bash
npx eas build --profile development --platform all
```

Expo Go still works for most of the app (email auth, workouts, progress, nutrition). Purchases fail safely: you stay on the Free plan and the upgrade screen explains why.

### Type-check

```bash
npm run typecheck
```

---

## Environment variables

| Variable | Where to find it |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat → Project → API keys → Apple App Store public key (`appl_…`) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat → Project → API keys → Google Play public key (`goog_…`) |
| `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT` | The entitlement identifier, default `premium` |

> ⚠️ **Never put the Supabase `service_role` key in the app or in `.env`.** It bypasses all security. It's only used by the Edge Function (where Supabase injects it automatically) and in the dashboard.

Edge Function secrets (set with the Supabase CLI, **not** in `.env`):

| Secret | Purpose |
| --- | --- |
| `REVENUECAT_SECRET_API_KEY` | RevenueCat secret API key (`sk_…`), used by `sync-subscription` to confirm payments |
| `REVENUECAT_WEBHOOK_AUTH` | Shared secret that RevenueCat sends in the `Authorization` header, e.g. `Bearer 3f9…` |
| `REVENUECAT_ENTITLEMENT` | Optional, defaults to `premium` |

---

## Supabase setup

1. **Create a project** and pick an **EU region** (for example `eu-west-2 London` or `eu-central-1 Frankfurt`) to meet the data-residency commitment in the privacy policy.
2. **Run the migrations**, either with the CLI:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```

   ```bash
   npx supabase db push
   ```

   or by pasting each file in `supabase/migrations/` into the SQL Editor, in filename order.

   | Migration | Contents |
   | --- | --- |
   | `…01_initial_schema.sql` | `profiles`, `workout_templates`, `workout_logs`, `weight_logs`, `chat_messages` |
   | `…02_functions_and_triggers.sql` | `is_premium`, `is_username_available`, `delete_user_account`, `mark_admin_messages_read`, plus triggers that protect the subscription fields and enforce the 7-template free limit |
   | `…03_row_level_security.sql` | RLS on every table: users can only read/write their own rows; sending chat messages requires Premium |
   | `…04_realtime_and_admin.sql` | Realtime for `chat_messages`, the `admin_chat_inbox` view and the `admin_reply()` helper |

3. **Auth → URL Configuration:**
   - Site URL: `projectbuilt://`
   - Redirect URLs: add `projectbuilt://auth-callback` and `projectbuilt://reset-password`. During development also add the `exp://…` URLs that Expo prints, or a wildcard such as `exp://**`.
4. **Auth → Providers → Email:** turn on "Confirm email" (recommended). The sign-up screen handles the "check your inbox" step.
5. **Auth → Email templates:** brand them as ProjectBuilt. The reset-password template's `{{ .ConfirmationURL }}` will deep-link back into the app.
6. **Deploy the RevenueCat webhook** (see [RevenueCat](#revenuecat--subscriptions)).

These migrations were tested against PostgreSQL 16 with a stub of Supabase's `auth` schema. The tests covered RLS isolation between users, attempts to change your own subscription status, the template limit, chat gating, admin replies and cascading account deletion.

---

## Sign in with Apple & Google

Both providers use Supabase OAuth. On **iOS**, Apple sign-in uses the native sheet (`expo-apple-authentication` → `signInWithIdToken`). On **Android**, Apple sign-in uses Supabase's web OAuth flow through `expo-auth-session` / `expo-web-browser`.

### Apple

1. **Apple Developer → Certificates, IDs & Profiles**
   - **App ID** `com.projectbuilt.app`: enable the *Sign in with Apple* capability.
   - **Services ID** (e.g. `com.projectbuilt.app.web`), used for web OAuth / Android: enable *Sign in with Apple*, set the domain to `<project-ref>.supabase.co` and the return URL to `https://<project-ref>.supabase.co/auth/v1/callback`.
   - **Key:** create a key with *Sign in with Apple* enabled and download the `.p8` file. Note the Key ID and your Team ID.
2. **Supabase → Auth → Providers → Apple:** enable it.
   - **Client IDs:** `com.projectbuilt.app,com.projectbuilt.app.web` (bundle ID for native, Services ID for web).
   - **Secret key:** generate the client secret JWT from the `.p8` file, Team ID, Key ID and Services ID. Supabase's docs link to a generator. **This secret expires every 6 months**, so set a reminder to regenerate it.
3. `app.json` already sets `ios.usesAppleSignIn: true` and includes the `expo-apple-authentication` plugin.

> App Store rule 4.8: because the app offers Google sign-in, it **must** also offer Sign in with Apple on iOS. It does.

### Google

1. **Google Cloud Console → APIs & Services**
   - Configure the **OAuth consent screen**: app name ProjectBuilt, support email, privacy policy URL, and the scopes `email`, `profile` and `openid`.
   - **Credentials → Create OAuth client ID → Web application.** Add the authorised redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
2. **Supabase → Auth → Providers → Google:** enable it and paste the Web client ID and secret.
3. No native Google SDK is needed. The flow opens the system browser and returns to `projectbuilt://auth-callback`.

---

## RevenueCat & subscriptions

**Pricing:** £1.99/month and £14.99/year (about 37% cheaper than paying monthly), each with a **7-day free trial** for new subscribers.

### 1. Create the products in the stores

**App Store Connect** (My Apps → ProjectBuilt → Subscriptions):
- Create a subscription group called "ProjectBuilt Premium".
- Add `projectbuilt_premium_monthly` (1 month, £1.99) and `projectbuilt_premium_annual` (1 year, £14.99).
- On each product, add an **Introductory Offer → Free → 1 week** for new subscribers.
- Fill in the localisation, add a review screenshot, and accept the Paid Apps agreement under Agreements, Tax & Banking.
- Create an **App-Specific Shared Secret** or an **In-App Purchase Key**, which RevenueCat needs.

**Google Play Console** (Monetise → Subscriptions):
- Create the subscription `projectbuilt_premium` with two base plans: `monthly` (£1.99, auto-renewing, 1 month) and `annual` (£14.99, 1 year).
- On each base plan, add an **offer → Free trial 7 days → eligibility: new customers**.
- Link a **Google Cloud service account** with financial permissions so RevenueCat can validate purchases. RevenueCat's docs walk through this.
- You must upload a build (internal testing track) that includes the BILLING permission before you can create products. `app.json` already declares it.

### 2. Configure RevenueCat

1. Create a project and add an **App Store app** (bundle ID plus the shared secret or IAP key) and a **Play Store app** (package name plus the service-account JSON).
2. **Products:** import the four store products.
3. **Entitlements:** create `premium` and attach all the products.
4. **Offerings:** create a `default` offering (marked *Current*) with these packages:
   - `$rc_monthly` → the monthly products
   - `$rc_annual` → the annual products
5. **API keys:** copy the public iOS and Android SDK keys into `.env`.

The app calls `Purchases.configure({ appUserID: <supabase user id> })`, so RevenueCat customers line up with Supabase users.

### 3. Sync subscription status to Supabase (required)

Premium is enforced **server-side**. RLS only lets Premium users send chat messages, and a trigger blocks a free user's 8th template. The subscription fields can only be written by the service role, so you must deploy **both** functions below.

**a) Payment confirmation (`sync-subscription`).** Straight after a purchase or restore, the app calls this function. It looks the user up with RevenueCat's REST API (RevenueCat validates the App Store / Google Play receipt) and records the result on the profile. Premium is unlocked only when this confirms an active, paid (or free-trial) entitlement.

```bash
npx supabase functions deploy sync-subscription
```

```bash
npx supabase secrets set REVENUECAT_SECRET_API_KEY="sk_your_secret_key"
```

Use the **secret** API key from RevenueCat → Project → API keys. Never put it in the app.

**b) Ongoing updates (`revenuecat-webhook`).** Renewals, cancellations, billing issues and expiries arrive through the webhook:

```bash
npx supabase functions deploy revenuecat-webhook --no-verify-jwt
```

```bash
npx supabase secrets set REVENUECAT_WEBHOOK_AUTH="Bearer $(openssl rand -hex 32)"
```

Then in **RevenueCat → Project → Integrations → Webhooks**:
- URL: `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`
- Authorization header: the exact value you set for `REVENUECAT_WEBHOOK_AUTH` (including `Bearer `)

Use "Send test event" to check the connection. Test events are acknowledged and ignored.

**Purchase flow in the app:**
1. The user picks a plan, and an in-app dialog shows the plan, price, trial and auto-renewal terms.
2. **Continue to payment** opens the App Store / Google Play payment sheet, where the user confirms and pays.
3. The app calls `sync-subscription`, retrying for a few seconds. Premium (unlimited templates, locked tips, chat) unlocks only once the server has confirmed payment.

| What happens | What the user sees |
| --- | --- |
| Payment is still pending (Ask to Buy, slow card) | "Payment pending". Nothing is unlocked. |
| The store has accepted it but the server hasn't confirmed yet | "Confirming your payment…" with a **Check again** button |
| The user cancels the payment sheet | Nothing changes |

Because the app and the database both read the same server-confirmed status, unlimited templates work as soon as the purchase is confirmed. The database's template-limit trigger never disagrees with the app.

**Manage Subscription** in Profile opens the native App Store subscription sheet on iOS, or the Google Play subscriptions page on Android.

### Testing purchases

- **iOS:** use a Sandbox tester (App Store Connect → Users and Access → Sandbox). Renewals are accelerated (1 month = 5 minutes).
- **Android:** add license testers in Play Console → Setup → License testing, and install from the internal testing track.

---

## Replying to Premium chat messages (admin)

Every message is stored in `public.chat_messages` with `sender = 'user'`. Coach replies are rows with `sender = 'admin'`, and they reach the user's chat **in real time**.

### See who's waiting

Supabase Dashboard → **SQL Editor**:

```sql
select * from public.admin_chat_inbox;
```

Threads where the last message came from the user, with `unread_from_user > 0`, appear first.

To read one conversation:

```sql
select sender, message, created_at
from public.chat_messages
where user_id = (select id from public.profiles where username = 'their_username')
order by created_at;
```

### Reply

```sql
select public.admin_reply('their_username', 'Great question! For fat loss I''d …');
```

`admin_reply` inserts your message as `sender = 'admin'` and marks the user's messages as read (answered). It refuses calls from the app's roles, so it only works from the dashboard or with the service role.

You can also use **Table Editor → chat_messages → Insert row**: set `user_id`, `sender = admin` and `message`.

> Stick to general information, in line with the disclaimer shown in the chat. Don't give individual medical advice. Signpost to a GP, NHS 111 or a registered dietitian where appropriate.

**Later:** build a small admin web app that uses the service role key on a server, or Supabase Edge Functions. The table structure doesn't need to change.

---

## App Store / Google Play submission checklist

### Both stores
- [ ] Replace every `[PLACEHOLDER]` in `src/data/legal.ts` (business name, address, ICO number, emails) and get the Privacy Policy and Terms reviewed by a solicitor.
- [ ] Host the Privacy Policy and Terms at public URLs; both stores require these.
- [ ] App icon (1024×1024, no transparency for iOS), adaptive icon (Android) and splash screen. Add them to `assets/` and reference them in `app.json`.
- [ ] Bump `version` (and `ios.buildNumber` / `android.versionCode`) in `app.json` for each release.
- [ ] Set `EXPO_PUBLIC_*` env vars for production builds (EAS → Environment variables).
- [ ] Supabase: production project in an EU region, email confirmation on, custom SMTP for auth emails, and backups and Point-in-Time Recovery considered.
- [ ] RevenueCat webhook deployed and tested with a real sandbox purchase.
- [ ] Test the full flow on real devices: sign up, choose a username, the questionnaire, the PAR-Q, create a template, log a workout, log weight, upgrade, chat, then delete the account.
- [ ] Test in both light and dark mode.
- [ ] Health disclaimer: the app gives general fitness information only and is not a medical device.

### Apple App Store
- [ ] Paid Apps agreement, banking and tax completed.
- [ ] Subscription products "Ready to Submit" and attached to the app version.
- [ ] **App Privacy ("nutrition label"):** Contact Info (email), Health & Fitness (weight, workouts, PAR-Q outcome), User Content (chat), Identifiers (user ID), Purchases. Data is linked to the user, not used for tracking.
- [ ] **Account deletion in-app** (Guideline 5.1.1(v)): done, under Profile → Delete account.
- [ ] **Sign in with Apple** offered alongside Google (4.8): done.
- [ ] Subscription screen shows price, duration, auto-renew terms and links to Terms and Privacy (3.1.2): done, on `premium/upgrade`.
- [ ] Restore Purchases button: done.
- [ ] Demo account in App Review notes, preferably with Premium (use a sandbox account or grant it by setting `subscription_status`/`subscription_expiry` in the dashboard).
- [ ] Age rating questionnaire (likely 4+ or 12+), category Health & Fitness.
- [ ] Encryption export compliance: `ITSAppUsesNonExemptEncryption` is already `false`.

### Google Play
- [ ] **Data safety form**, matching the App Privacy answers above. Data is encrypted in transit and users can request deletion.
- [ ] **Account deletion:** in-app, plus a **web URL** where users can request deletion (a Play requirement).
- [ ] **Health apps declaration** (Policy → App content → Health apps).
- [ ] Target API level meets the current Play requirement (Expo SDK 51 targets API 34).
- [ ] Content rating questionnaire, target audience 16+.
- [ ] Closed testing with at least 12 testers for 14 days, if this is a new personal developer account.
- [ ] Upload the AAB to internal testing first, then promote it to production.

### Build & submit
```bash
npx eas build --platform all --profile production
```

```bash
npx eas submit --platform ios
```

```bash
npx eas submit --platform android
```

---

## ICO registration reminder

> **Before launch, register with the Information Commissioner's Office (ICO) and pay the data protection fee.**

- Organisations and sole traders that process personal data generally must pay the fee under the Data Protection (Charges and Information) Regulations 2018. A fitness app that processes health data almost certainly needs to.
- Register at **ico.org.uk/for-organisations/data-protection-fee**. Most small businesses fall into tier 1 — check the current fee on the ICO website.
- Add your registration number to `src/data/legal.ts` (`[ICO NUMBER]`).
- The app shows: *"ProjectBuilt is registered with the ICO under the UK Data Protection Act 2018."* in Profile, Settings and the legal screens. **Don't ship until that statement is true.**
- Also consider a Data Protection Impact Assessment (DPIA), since you process health data, and keep a record of processing activities. Sign data processing agreements with Supabase and RevenueCat (both offer them).

---

## How it works (architecture notes)

**Auth & routing.** `app/_layout.tsx` initialises Supabase auth. The session is persisted in `expo-secure-store` through a chunked adapter, because SecureStore values are limited to about 2 KB. The layout also gates routes:

| User state | Where they go |
| --- | --- |
| No session | `(auth)/welcome` |
| Session but no profile | `(onboarding)/username` |
| Profile exists | `(tabs)` |

The questionnaire can be skipped at any time. Home then shows a "Personalise" card.

**PAR-Q.** This step is required before any workout can be started. `useStartWorkout` redirects to the PAR-Q if it hasn't been completed. If any answer is "Yes", the user sees the "consult your GP" advice, the profile stores `parq_cleared = false`, and a warning banner appears on the active workout screen. Only the outcome is stored, not the individual answers (data minimisation).

**Quick workout.** `workouts/quick` lets the user pick one or more muscle groups, and `src/utils/generateWorkout.ts` builds a workout from the exercise library. It uses the profile's equipment, goal and level, and **Shuffle** gives a new mix. Below that are coach-written pre-made workouts from `src/data/premade-workouts.ts`, filtered to the selected muscles. Any of them can be started straight away or saved as a template (the free plan's 7-template limit still applies).

**Active workout.** The session lives in a persisted Zustand store, so it survives the app being closed. Ticking a set auto-starts the rest timer (±15s and Skip controls, with a vibration when it finishes). When the workout is finished, only completed sets are kept. The summary screen saves the session to `workout_logs`.

**Weight units.** Every weight is stored with the unit it was entered in, and converted for display using the profile's `weight_unit`.

**Weekly plan.** `profiles.weekly_plan` maps each weekday (`0` = Sunday … `6`) to a template ID. It's edited on the Workouts tab and drives "Today's Workout" on Home. "Week N of your plan" counts from `plan_started_at`, which is set when onboarding is completed.

**Estimated template duration.** Calculated as sets × (rest time + about 40 seconds of work per set).

**Body map.** An SVG front/back figure. Muscle groups with at least one completed set in the selected period (this week starting Monday, or the last 7 days) are filled with the accent colour. A *full body* exercise lights up every region.

**Premium.**

| Area | How Premium is decided |
| --- | --- |
| Client | `usePremium()` reads only the server-confirmed subscription fields on the profile (set by `sync-subscription` or the webhook). A store entitlement that hasn't been confirmed yet shows as "Confirming your payment…" |
| Server | `public.is_premium(uid)`, used by RLS and the template-limit trigger |

**Content.** Nutrition tips, Sunday advice, exercises, PAR-Q and legal text are all plain TypeScript files in `src/data/`. Edit them without touching any screens.
