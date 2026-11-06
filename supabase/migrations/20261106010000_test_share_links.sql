-- Public, view-only share links for test reports. The token is random and unguessable;
-- revoking sets it to null so old links stop working. Shared pages are served by trusted
-- server code (service role) that looks a test up by token only, so no RLS policy changes.
alter table public.tests
  add column if not exists share_token text unique,
  add column if not exists shared_at timestamptz;
