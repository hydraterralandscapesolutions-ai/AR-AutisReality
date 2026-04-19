create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_tasks jsonb not null default '[]'::jsonb,
  reward_points integer not null default 12 check (reward_points >= 0),
  reward_message text not null default 'Great consistency this week.',
  regulation_index integer not null default 0,
  completion_history jsonb not null default '[]'::jsonb,
  claimed_badges jsonb not null default '[]'::jsonb,
  reminders jsonb not null default '[]'::jsonb,
  reminder_preferences jsonb not null default '{"soundEnabled": true, "vibrationEnabled": false, "dndEnabled": false, "dndStart": "22:00", "dndEnd": "07:00"}'::jsonb,
  display_name text not null default '',
  children jsonb not null default '[]'::jsonb,
  reward_points_by_child jsonb not null default '{}'::jsonb,
  reward_message_by_child jsonb not null default '{}'::jsonb,
  regulation_index_by_child jsonb not null default '{}'::jsonb,
  game_progress_by_child jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_game_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_name text not null,
  sessions integer not null default 0 check (sessions >= 0),
  high_score integer not null default 0 check (high_score >= 0),
  last_played_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_name)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_app_state_updated_at on public.user_app_state;

create trigger user_app_state_updated_at
before update on public.user_app_state
for each row
execute function public.set_updated_at();

drop trigger if exists user_game_progress_updated_at on public.user_game_progress;

create trigger user_game_progress_updated_at
before update on public.user_game_progress
for each row
execute function public.set_updated_at();

alter table public.user_app_state enable row level security;
alter table public.user_game_progress enable row level security;

drop policy if exists "Users can view own app state" on public.user_app_state;
create policy "Users can view own app state"
on public.user_app_state
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own app state" on public.user_app_state;
create policy "Users can insert own app state"
on public.user_app_state
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own app state" on public.user_app_state;
create policy "Users can update own app state"
on public.user_app_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own game progress" on public.user_game_progress;
create policy "Users can view own game progress"
on public.user_game_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own game progress" on public.user_game_progress;
create policy "Users can insert own game progress"
on public.user_game_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own game progress" on public.user_game_progress;
create policy "Users can update own game progress"
on public.user_game_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.admin_dashboard_summary(p_days integer default 7)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  range_days integer := greatest(1, coalesce(p_days, 7));
  result jsonb;
begin
  if coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Admin role required for dashboard summary';
  end if;

  with role_counts as (
    select
      count(*)::integer as total_users,
      count(*) filter (
        where coalesce(raw_user_meta_data ->> 'role', 'parent') = 'admin'
      )::integer as admin_users,
      count(*) filter (
        where coalesce(raw_user_meta_data ->> 'role', 'parent') = 'parent'
      )::integer as parent_users
    from auth.users
  ),
  state_counts as (
    select
      coalesce(round(avg(reward_points)::numeric, 1), 0)::numeric as avg_reward_points,
      coalesce(round(avg((entry.value ->> 'completionRate')::numeric), 1), 0)::numeric as avg_completion_rate,
      count(distinct s.user_id) filter (
        where (entry.value ->> 'date')::date >= current_date - (range_days - 1)
      )::integer as active_users
    from public.user_app_state s
    left join lateral jsonb_array_elements(s.completion_history) as entry(value) on true
  )
  select jsonb_build_object(
    'total_users', role_counts.total_users,
    'admin_users', role_counts.admin_users,
    'parent_users', role_counts.parent_users,
    'avg_reward_points', state_counts.avg_reward_points,
    'avg_completion_rate', state_counts.avg_completion_rate,
    'active_users', state_counts.active_users,
    'range_days', range_days
  )
  into result
  from role_counts, state_counts;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_summary(integer) from public;
grant execute on function public.admin_dashboard_summary(integer) to authenticated;