-- lead-tracker initial schema
-- Creates: lead_status enum, leads table, RLS policies, last_contacted_at trigger.

-- ---------- Enum ----------
create type public.lead_status as enum (
  'not_called',
  'voicemail',
  'interested',
  'not_interested',
  'sold'
);

-- ---------- Table ----------
create table public.leads (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,

  business_name      text not null,
  category           text,
  city               text,
  address            text,
  phone              text,
  google_maps_url    text,
  rating             numeric(2,1),
  total_reviews      integer,
  hours_today        text,
  place_id           text not null,

  status             public.lead_status not null default 'not_called',
  notes              text,
  next_follow_up_at  date,
  last_contacted_at  timestamptz,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Dedupe scope: a given Google place is unique *per user*. Two users may
  -- independently track the same business.
  unique (user_id, place_id)
);

-- Indexes for the table view (filter by status, order by created_at).
create index leads_user_status_idx  on public.leads (user_id, status);
create index leads_user_created_idx on public.leads (user_id, created_at desc);

-- ---------- Trigger: auto-bump timestamps ----------
-- Bumps updated_at on every UPDATE, and stamps last_contacted_at whenever
-- the status column actually changes. We treat any status transition as a
-- contact event, including transitions between non-default statuses.
create function public.tg_leads_touch_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then
    new.last_contacted_at = now();
  end if;
  return new;
end;
$$;

create trigger leads_touch_timestamps
before update on public.leads
for each row execute function public.tg_leads_touch_timestamps();

-- ---------- Row Level Security ----------
alter table public.leads enable row level security;

create policy "leads_select_own"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "leads_insert_own"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "leads_update_own"
  on public.leads for update
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "leads_delete_own"
  on public.leads for delete
  using (auth.uid() = user_id);
