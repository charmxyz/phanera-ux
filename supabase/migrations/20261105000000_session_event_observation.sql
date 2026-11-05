-- What the agent observed on the page before each action (used by the journey graph).
alter table public.session_events add column if not exists observation text;
