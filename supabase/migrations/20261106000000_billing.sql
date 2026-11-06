-- Billing: one paid plan (Startup), paid through Stripe or PayPal, or granted manually ("comp").
-- Only trusted server code (webhooks / server actions using the service role) writes these
-- columns; the existing "own profile" policy lets users read them, never write them.
alter table public.profiles
  add column if not exists billing_provider text check (billing_provider in ('stripe', 'paypal', 'comp')),
  add column if not exists stripe_customer_id text unique,
  add column if not exists subscription_id text unique,
  add column if not exists subscription_status text,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;

create index if not exists profiles_subscription_id_idx on public.profiles (subscription_id);
