-- Phanera MVP schema (PRD §15)
-- Security model: every table has RLS. Authenticated users may only SELECT
-- their own rows. All writes are performed by trusted server code
-- (server actions / workers) using the service role after verifying the user,
-- so clients can never tamper with status, usage or findings.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'startup')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Websites & discovered pages
-- ---------------------------------------------------------------------------
create table public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  domain text not null,
  title text,
  description text,
  favicon_url text,
  discovery_status text not null default 'queued' check (discovery_status in
    ('queued', 'fetching', 'discovering', 'extracting', 'analysing', 'complete', 'partial', 'failed')),
  discovery_error text,
  summary jsonb,
  readiness jsonb,
  suggested_goals jsonb,
  suggested_personas jsonb,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, domain)
);
create index websites_user_idx on public.websites (user_id, updated_at desc);

create table public.website_pages (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  title text,
  page_type text,
  content_summary text,
  crawl_status text not null default 'ok',
  word_count integer,
  created_at timestamptz not null default now()
);
create index website_pages_website_idx on public.website_pages (website_id);

-- ---------------------------------------------------------------------------
-- Tests, personas, sessions, events
-- ---------------------------------------------------------------------------
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  website_id uuid not null references public.websites (id) on delete cascade,
  title text not null,
  goal text not null,
  status text not null default 'queued' check (status in
    ('queued', 'running', 'evaluating', 'complete', 'partial', 'failed')),
  configuration jsonb not null default '{}'::jsonb,
  summary jsonb,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index tests_user_idx on public.tests (user_id, created_at desc);
create index tests_website_idx on public.tests (website_id, created_at desc);

create table public.personas (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  role text not null,
  goal text not null,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index personas_test_idx on public.personas (test_id);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'queued' check (status in
    ('queued', 'running', 'completed', 'failed')),
  outcome text check (outcome in
    ('success', 'partial_success', 'failed', 'abandoned', 'blocked', 'inconclusive')),
  duration_ms integer,
  action_count integer not null default 0,
  current_activity text,
  agent_summary text,
  evaluation jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index sessions_test_idx on public.sessions (test_id);

create table public.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  step integer not null,
  timestamp timestamptz not null default now(),
  action text not null,
  target text,
  url text,
  result text,
  reasoning text,
  screenshot_path text,
  error text
);
create index session_events_session_idx on public.session_events (session_id, step);

-- ---------------------------------------------------------------------------
-- Findings & usage
-- ---------------------------------------------------------------------------
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  confidence text not null check (confidence in ('confirmed', 'likely', 'hypothesis')),
  impacted_personas text[] not null default '{}',
  recommendation text not null,
  evidence jsonb not null default '[]'::jsonb,
  page_url text,
  created_at timestamptz not null default now()
);
create index findings_test_idx on public.findings (test_id);

create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  test_id uuid references public.tests (id) on delete set null,
  website_id uuid references public.websites (id) on delete set null,
  usage_type text not null check (usage_type in ('test_run', 'discovery_scan')),
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
create index usage_user_idx on public.usage (user_id, usage_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Pending authentication intents (PRD §7.7). Service-role only.
-- ---------------------------------------------------------------------------
create table public.pending_auth_intents (
  id uuid primary key default gen_random_uuid(),
  normalized_url text not null,
  state_token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index pending_auth_intents_expiry_idx on public.pending_auth_intents (expires_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.websites enable row level security;
alter table public.website_pages enable row level security;
alter table public.tests enable row level security;
alter table public.personas enable row level security;
alter table public.sessions enable row level security;
alter table public.session_events enable row level security;
alter table public.findings enable row level security;
alter table public.usage enable row level security;
alter table public.pending_auth_intents enable row level security;
-- pending_auth_intents intentionally has no policies: service role only.

create policy "own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own websites" on public.websites for select to authenticated using (user_id = (select auth.uid()));
create policy "own pages" on public.website_pages for select to authenticated using (user_id = (select auth.uid()));
create policy "own tests" on public.tests for select to authenticated using (user_id = (select auth.uid()));
create policy "own personas" on public.personas for select to authenticated using (user_id = (select auth.uid()));
create policy "own sessions" on public.sessions for select to authenticated using (user_id = (select auth.uid()));
create policy "own events" on public.session_events for select to authenticated using (user_id = (select auth.uid()));
create policy "own findings" on public.findings for select to authenticated using (user_id = (select auth.uid()));
create policy "own usage" on public.usage for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Evidence storage: private bucket, objects stored under <user_id>/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

create policy "read own evidence" on storage.objects for select to authenticated
  using (bucket_id = 'evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
