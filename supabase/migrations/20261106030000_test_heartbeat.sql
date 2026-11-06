-- Running tests check in every ~15s. If a worker dies mid-test (out of memory, redeploy),
-- the heartbeat goes stale and the next worker sweep restarts the test once, then fails it.
alter table public.tests
  add column if not exists heartbeat_at timestamptz,
  add column if not exists attempts integer not null default 0;
