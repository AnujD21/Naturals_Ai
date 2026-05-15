-- ══════════════════════════════════════════════════════════════
-- Naturals AI — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run it.
-- ══════════════════════════════════════════════════════════════

-- ── Stylists ──────────────────────────────────────────────────
create table if not exists public.stylists (
  id           text primary key,
  name         text not null,
  role         text,
  specialization text,
  shift        text,
  shift_hours  text,
  initials     text,
  accent_color text,
  rating       numeric(3,1) default 5.0,
  completed_today int default 0,
  status       text default 'active'
);

insert into public.stylists values
  ('s1','Aisha','Senior Colorist','Balayage & Color Correction','Morning Shift','9:00 AM – 3:00 PM','AI','#C9A84C',4.9,2,'active'),
  ('s2','Priya','Style Specialist','Hair Spa & Treatments','Full Day','9:00 AM – 6:00 PM','PR','#A0B89A',4.8,3,'active'),
  ('s3','Kavya','Master Stylist','Precision Cuts & Blowouts','Afternoon Shift','12:00 PM – 8:00 PM','KV','#7BA7BC',4.7,1,'active')
on conflict (id) do nothing;

-- ── Managers ──────────────────────────────────────────────────
create table if not exists public.managers (
  id       serial primary key,
  username text unique not null,
  password text not null
);

insert into public.managers (username, password) values
  ('manager', 'naturals2024'),
  ('admin',   'admin123')
on conflict (username) do nothing;

-- ── Clients ───────────────────────────────────────────────────
create table if not exists public.clients (
  id           text primary key,
  name         text not null,
  phone        text default '',
  email        text default '',
  initials     text,
  created_at   timestamptz default now(),
  preferences  jsonb default '{"preferredStylist":"","colorHistory":[],"allergies":"Not recorded","notes":""}',
  last_analysis jsonb
);

-- ── Visits ────────────────────────────────────────────────────
create table if not exists public.visits (
  id         serial primary key,
  client_id  text references public.clients(id) on delete cascade,
  date       date default current_date,
  service    text,
  stylist    text,
  notes      text,
  created_at timestamptz default now()
);

-- ── Sessions ──────────────────────────────────────────────────
create table if not exists public.sessions (
  id              text primary key,
  stylist_id      text references public.stylists(id),
  client_name     text,
  client_initials text,
  service         text,
  status          text default 'In Progress',
  progress        int  default 0,
  current_step    int  default 1,
  total_steps     int  default 4,
  step_name       text,
  start_time      text,
  category        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Activity Log ──────────────────────────────────────────────
create table if not exists public.activity_log (
  id           serial primary key,
  stylist_name text,
  text         text,
  type         text default 'service',
  created_at   timestamptz default now()
);

-- ── RLS — allow anon read/write for demo ─────────────────────
alter table public.stylists     enable row level security;
alter table public.managers     enable row level security;
alter table public.clients      enable row level security;
alter table public.visits       enable row level security;
alter table public.sessions     enable row level security;
alter table public.activity_log enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='stylists'     and policyname='allow_all') then
    create policy allow_all on public.stylists     for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='managers'     and policyname='allow_all') then
    create policy allow_all on public.managers     for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='clients'      and policyname='allow_all') then
    create policy allow_all on public.clients      for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='visits'       and policyname='allow_all') then
    create policy allow_all on public.visits       for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='sessions'     and policyname='allow_all') then
    create policy allow_all on public.sessions     for all using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='activity_log' and policyname='allow_all') then
    create policy allow_all on public.activity_log for all using (true) with check (true); end if;
end $$;

-- ── Seed clients ──────────────────────────────────────────────
insert into public.clients (id, name, phone, email, initials, created_at, preferences, last_analysis) values
  ('c1','Meera Kapoor','+91 98201 34012','meera.kapoor@email.com','MK','2025-11-02T10:00:00Z',
   '{"preferredStylist":"Aisha Sharma","colorHistory":["Level 7 Ash Brown","Level 6 Warm Chestnut"],"allergies":"None known","notes":"Prefers low-ammonia formulas. Sensitive scalp."}',
   '{"date":"2026-04-20","hairType":"Type 2B — Wavy","porosity":"High","damage":"Moderate — heat damage at ends","confidence":96}'),
  ('c2','Rohan Verma','+91 99871 44550','rohan.verma@email.com','RV','2026-01-10T10:00:00Z',
   '{"preferredStylist":"Priya Nair","colorHistory":["Level 4 Natural Black"],"allergies":"PPD sensitivity — use PPD-free color","notes":"Short processing time preferred."}',
   null),
  ('c3','Sana Iyer','+91 97302 22890','sana.iyer@email.com','SI','2026-03-22T10:00:00Z',
   '{"preferredStylist":"Aisha Sharma","colorHistory":["Level 8 Platinum Ash"],"allergies":"None","notes":"Wants to go lighter next visit."}',
   null)
on conflict (id) do nothing;

-- ── Seed visits ───────────────────────────────────────────────
insert into public.visits (client_id, date, service, stylist, notes) values
  ('c1','2026-04-20','Balayage & Gloss','Aisha Sharma','Level 7 Ash Brown, 20Vol dev, 35min process'),
  ('c1','2026-03-08','Root Retouch','Aisha Sharma','Same formula #8821'),
  ('c1','2025-12-15','Full Color + Cut','Priya Nair','First visit. Wanted warmer tones.'),
  ('c2','2026-05-01','Root Retouch','Priya Nair','Level 4 Natural Black, 10Vol'),
  ('c3','2026-04-28','Extensions Install','Aisha Sharma','22-inch tape-ins, Shade 8/11');
