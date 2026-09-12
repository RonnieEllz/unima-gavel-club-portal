alter type public.membership_status add value if not exists 'alumni';

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create unique index if not exists semesters_one_active_idx
  on public.semesters (is_active) where is_active;

alter table public.profiles
  drop constraint if exists profiles_year_of_study_check;

alter table public.profiles
  add constraint profiles_year_of_study_check check (year_of_study between 1 and 6);

alter table public.semesters
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by uuid references auth.users(id);

create table if not exists public.member_progressions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete restrict,
  previous_year smallint not null check (previous_year between 1 and 6),
  next_year smallint check (next_year between 1 and 6),
  previous_status public.membership_status not null,
  next_status public.membership_status not null,
  processed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (member_id, semester_id)
);

create index if not exists member_progressions_member_idx
  on public.member_progressions(member_id, created_at desc);

alter table public.member_progressions enable row level security;

drop policy if exists "member_progressions_select_operations" on public.member_progressions;
drop policy if exists "member_progressions_insert_operations" on public.member_progressions;

create policy "member_progressions_select_operations"
  on public.member_progressions for select
  using (can_manage_operations());

create policy "member_progressions_insert_operations"
  on public.member_progressions for insert
  with check (can_manage_operations());