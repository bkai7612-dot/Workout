-- ProjectBuilt — progressive overload option per workout template.
-- When on, the active workout shows what the user did in the last session of
-- the same template next to each set, so they can try to beat it.

alter table public.workout_templates
  add column if not exists progressive_overload boolean not null default true;

-- Fast lookup of the most recent log for a template.
create index if not exists workout_logs_template_idx
  on public.workout_logs (user_id, template_id, started_at desc);
