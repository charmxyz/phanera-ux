-- Lets a user stop a running test. The worker watches this column and stops the remaining
-- personas; if the worker doesn't respond, the app (or the worker's stale-job sweep)
-- force-stops the test after a short grace period.
alter table public.tests add column if not exists cancel_requested_at timestamptz;
