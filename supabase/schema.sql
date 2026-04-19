create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_tasks jsonb not null default '[]'::jsonb,
  reward_points integer not null default 12 check (reward_points >= 0),
  reward_message text not null default 'Great consistency this week.',
  regulation_index integer not null default 0,
  updated_at timestamptz not null default now()
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

alter table public.user_app_state enable row level security;

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