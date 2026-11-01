-- ProjectBuilt — realtime for chat + an admin inbox view for the dashboard

-- Stream chat inserts/updates to the app so coach replies appear instantly.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

-- Admin inbox: every chat thread with its latest message and unread count.
-- security_invoker means RLS still applies to API users (they only ever see
-- their own thread); the dashboard/service role sees everything.
create or replace view public.admin_chat_inbox
with (security_invoker = true) as
select
  p.id as user_id,
  p.username,
  max(m.created_at) as last_message_at,
  (array_agg(m.message order by m.created_at desc))[1] as last_message,
  (array_agg(m.sender order by m.created_at desc))[1] as last_sender,
  count(*) filter (where m.sender = 'user' and m.read = false) as unread_from_user
from public.chat_messages m
join public.profiles p on p.id = m.user_id
group by p.id, p.username
order by (array_agg(m.sender order by m.created_at desc))[1] = 'user' desc, max(m.created_at) desc;

revoke all on public.admin_chat_inbox from anon, authenticated;

-- Convenience function for the admin to reply from the SQL editor:
--   select public.admin_reply('their_username', 'Great question! ...');
create or replace function public.admin_reply(target_username text, reply text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  new_id uuid;
begin
  if public.request_role() is not null and public.request_role() <> 'service_role' then
    raise exception 'admin_reply can only be called from the dashboard or with the service role';
  end if;
  select id into target from public.profiles where lower(username) = lower(target_username);
  if target is null then
    raise exception 'No user with username %', target_username;
  end if;
  -- Mark the user's messages as read (answered)
  update public.chat_messages set read = true where user_id = target and sender = 'user' and read = false;
  insert into public.chat_messages (user_id, sender, message) values (target, 'admin', reply) returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.admin_reply(text, text) from public, anon, authenticated;
