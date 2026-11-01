-- ProjectBuilt — Row Level Security
-- Users can only read/write their own rows. Admin access is via the service
-- role key (bypasses RLS) or the Supabase dashboard — never shipped in the app.

alter table public.profiles enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.chat_messages enable row level security;

-- profiles ───────────────────────────────────────────────────
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- No delete policy: account deletion goes through delete_user_account().

-- workout_templates ──────────────────────────────────────────
drop policy if exists "templates_select_own" on public.workout_templates;
create policy "templates_select_own" on public.workout_templates
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "templates_insert_own" on public.workout_templates;
create policy "templates_insert_own" on public.workout_templates
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "templates_update_own" on public.workout_templates;
create policy "templates_update_own" on public.workout_templates
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "templates_delete_own" on public.workout_templates;
create policy "templates_delete_own" on public.workout_templates
  for delete to authenticated using (user_id = auth.uid());

-- workout_logs ───────────────────────────────────────────────
drop policy if exists "logs_select_own" on public.workout_logs;
create policy "logs_select_own" on public.workout_logs
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "logs_insert_own" on public.workout_logs;
create policy "logs_insert_own" on public.workout_logs
  for insert to authenticated with check (
    user_id = auth.uid()
    and (template_id is null or exists (
      select 1 from public.workout_templates t where t.id = template_id and t.user_id = auth.uid()
    ))
  );

drop policy if exists "logs_update_own" on public.workout_logs;
create policy "logs_update_own" on public.workout_logs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "logs_delete_own" on public.workout_logs;
create policy "logs_delete_own" on public.workout_logs
  for delete to authenticated using (user_id = auth.uid());

-- weight_logs ────────────────────────────────────────────────
drop policy if exists "weights_select_own" on public.weight_logs;
create policy "weights_select_own" on public.weight_logs
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "weights_insert_own" on public.weight_logs;
create policy "weights_insert_own" on public.weight_logs
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "weights_update_own" on public.weight_logs;
create policy "weights_update_own" on public.weight_logs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "weights_delete_own" on public.weight_logs;
create policy "weights_delete_own" on public.weight_logs
  for delete to authenticated using (user_id = auth.uid());

-- chat_messages ──────────────────────────────────────────────
-- Users read their own thread. They may only send as 'user', and only with Premium.
-- Admin replies are inserted with sender = 'admin' from the dashboard / service role.
drop policy if exists "chat_select_own" on public.chat_messages;
create policy "chat_select_own" on public.chat_messages
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "chat_insert_own_premium" on public.chat_messages;
create policy "chat_insert_own_premium" on public.chat_messages
  for insert to authenticated with check (
    user_id = auth.uid()
    and sender = 'user'
    and read = false
    and public.is_premium(auth.uid())
  );
-- No update/delete policies for users (read receipts go through mark_admin_messages_read()).
