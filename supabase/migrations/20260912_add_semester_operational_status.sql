alter table public.profiles
  add column if not exists membership_activated_at timestamptz;

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create or replace function public.can_manage_semesters()
returns boolean as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator')
  );
$$ language sql security definer set search_path = public stable;

create unique index if not exists semesters_one_active_idx
  on public.semesters (is_active) where is_active;

alter table public.semesters enable row level security;

drop policy if exists "semesters_select_operations" on public.semesters;
drop policy if exists "semesters_insert_operations" on public.semesters;
drop policy if exists "semesters_update_operations" on public.semesters;
drop policy if exists "semesters_delete_operations" on public.semesters;

create policy "semesters_select_operations"
  on public.semesters for select
  using (can_manage_operations());

create policy "semesters_insert_operations"
  on public.semesters for insert
  with check (can_manage_semesters());

create policy "semesters_update_operations"
  on public.semesters for update
  using (can_manage_semesters())
  with check (can_manage_semesters());

create policy "semesters_delete_operations"
  on public.semesters for delete
  using (can_manage_semesters());