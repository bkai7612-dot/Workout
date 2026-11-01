-- ProjectBuilt — helper functions and triggers

-- Returns the role from the current request's JWT ('authenticated', 'anon',
-- 'service_role') or NULL for direct database sessions (SQL editor, migrations).
create or replace function public.request_role()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
$$;

-- Is the user currently entitled to Premium? Kept in sync by the RevenueCat webhook.
-- Cancelled / billing-issue subscriptions keep access until the expiry date.
create or replace function public.is_premium(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid
      and p.subscription_status in ('active', 'trialing', 'cancelled', 'billing_issue')
      and (
        (p.subscription_expiry is not null and p.subscription_expiry > now())
        or (p.subscription_expiry is null and p.subscription_status in ('active', 'trialing'))
      )
  );
$$;

-- Username availability check (RLS hides other users' profiles from clients).
create or replace function public.is_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select candidate ~ '^[A-Za-z0-9_]{3,20}$'
     and not exists (
       select 1 from public.profiles
       where lower(username) = lower(candidate)
         and id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
     );
$$;

-- Subscription fields can only be changed by the service role (webhook) or an admin
-- in the dashboard — never by the app itself.
create or replace function public.protect_subscription_fields()
returns trigger
language plpgsql
as $$
begin
  if public.request_role() in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.subscription_status := 'none';
      new.subscription_expiry := null;
    else
      new.subscription_status := old.subscription_status;
      new.subscription_expiry := old.subscription_expiry;
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_subscription on public.profiles;
create trigger profiles_protect_subscription
  before insert or update on public.profiles
  for each row execute function public.protect_subscription_fields();

-- Free plan: max 7 workout templates (enforced server-side as well as in the app).
create or replace function public.enforce_template_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.request_role() = 'authenticated'
     and new.user_id = auth.uid()
     and not public.is_premium(new.user_id)
     and (select count(*) from public.workout_templates where user_id = new.user_id) >= 7 then
    raise exception 'TEMPLATE_LIMIT: Free plan is limited to 7 workout templates'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists workout_templates_limit on public.workout_templates;
create trigger workout_templates_limit
  before insert on public.workout_templates
  for each row execute function public.enforce_template_limit();

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists workout_templates_touch on public.workout_templates;
create trigger workout_templates_touch
  before update on public.workout_templates
  for each row execute function public.touch_updated_at();

-- Users mark coach replies as read without being able to edit messages.
create or replace function public.mark_admin_messages_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.chat_messages
     set read = true
   where user_id = auth.uid() and sender = 'admin' and read = false;
$$;

-- UK GDPR right to erasure: deletes the auth user; every row of user data
-- cascades (profiles → templates, logs, weight logs, chat messages).
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from public.profiles where id = uid; -- explicit, in case of FK changes
  delete from auth.users where id = uid;
end;
$$;

-- Function privileges
revoke all on function public.is_premium(uuid) from public, anon;
revoke all on function public.is_username_available(text) from public, anon;
revoke all on function public.mark_admin_messages_read() from public, anon;
revoke all on function public.delete_user_account() from public, anon;
grant execute on function public.is_premium(uuid) to authenticated;
grant execute on function public.is_username_available(text) to authenticated;
grant execute on function public.mark_admin_messages_read() to authenticated;
grant execute on function public.delete_user_account() to authenticated;
