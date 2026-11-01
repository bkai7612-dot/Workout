-- ProjectBuilt — initial schema
-- Tables: profiles, workout_templates, workout_logs, weight_logs, chat_messages

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  goal text check (goal in ('fat_loss', 'build_muscle', 'general_fitness', 'endurance')),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  equipment text check (equipment in ('bodyweight', 'dumbbells', 'full_gym')),
  days_per_week integer check (days_per_week between 1 and 7),
  gender text check (gender in ('male', 'female', 'prefer_not_to_say')),
  age integer check (age between 13 and 120),
  current_weight numeric check (current_weight > 0),
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  parq_completed boolean not null default false,
  parq_cleared boolean not null default true,
  onboarding_completed boolean not null default false,
  dark_mode text not null default 'system' check (dark_mode in ('system', 'dark', 'light')), -- 'system' | 'dark' | 'light'
  sunday_advice_enabled boolean not null default true,
  notifications_enabled boolean not null default false,
  weekly_plan jsonb not null default '{}'::jsonb,          -- { "1": "<template uuid>", ... } keyed by JS weekday (0 = Sunday)
  plan_started_at timestamptz,
  subscription_status text not null default 'none'
    check (subscription_status in ('none', 'active', 'trialing', 'cancelled', 'expired', 'billing_issue')),
  subscription_expiry timestamptz,
  created_at timestamptz not null default now()
);

-- Usernames are unique regardless of case.
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

-- ─────────────────────────────────────────────────────────────
-- workout_templates
-- ─────────────────────────────────────────────────────────────
create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  description text check (char_length(description) <= 280),
  exercises jsonb not null default '[]'::jsonb check (jsonb_typeof(exercises) = 'array'),
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_templates_user_idx on public.workout_templates (user_id, updated_at desc);

-- ─────────────────────────────────────────────────────────────
-- workout_logs
-- ─────────────────────────────────────────────────────────────
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.workout_templates (id) on delete set null,
  template_name text,
  started_at timestamptz not null,
  completed_at timestamptz,
  duration_seconds integer check (duration_seconds >= 0),
  exercise_logs jsonb not null default '[]'::jsonb check (jsonb_typeof(exercise_logs) = 'array'),
  muscle_groups_hit text[] not null default '{}',
  rating integer check (rating between 1 and 5),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists workout_logs_user_idx on public.workout_logs (user_id, started_at desc);

-- ─────────────────────────────────────────────────────────────
-- weight_logs
-- ─────────────────────────────────────────────────────────────
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  weight numeric not null check (weight > 0 and weight < 1000),
  unit text not null default 'kg' check (unit in ('kg', 'lbs')),
  logged_at timestamptz not null default now(),
  notes text check (char_length(notes) <= 200)
);
create index if not exists weight_logs_user_idx on public.weight_logs (user_id, logged_at);

-- ─────────────────────────────────────────────────────────────
-- chat_messages
-- ─────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')), -- 'user' | 'admin'
  message text not null check (char_length(message) between 1 and 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_idx on public.chat_messages (user_id, created_at);
create index if not exists chat_messages_unanswered_idx on public.chat_messages (created_at) where sender = 'user' and read = false;
