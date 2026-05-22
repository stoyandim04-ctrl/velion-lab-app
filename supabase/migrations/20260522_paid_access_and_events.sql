alter table public.subscriptions
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan = any (array['monthly'::text, 'yearly'::text, 'lifetime'::text]));

create unique index if not exists subscriptions_checkout_session_id_key
  on public.subscriptions (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_events enable row level security;

create index if not exists user_events_user_created_idx
  on public.user_events (user_id, created_at desc);

drop policy if exists "Users can insert own events" on public.user_events;
create policy "Users can insert own events"
  on public.user_events
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own events" on public.user_events;
create policy "Users can view own events"
  on public.user_events
  for select
  using (auth.uid() = user_id);
