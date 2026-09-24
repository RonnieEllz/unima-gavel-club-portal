create table if not exists public.custom_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image_url text,
  image_alt text not null default '',
  display_order integer not null default 0 check (display_order >= 0),
  is_visible boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_sections_display_order_idx
  on public.custom_sections (display_order, created_at);

drop trigger if exists custom_sections_set_updated_at on public.custom_sections;
create trigger custom_sections_set_updated_at
  before update on public.custom_sections
  for each row execute function set_updated_at();

alter table public.custom_sections enable row level security;

drop policy if exists "custom_sections_select_public" on public.custom_sections;
drop policy if exists "custom_sections_select_admin" on public.custom_sections;
drop policy if exists "custom_sections_insert_admin" on public.custom_sections;
drop policy if exists "custom_sections_update_admin" on public.custom_sections;
drop policy if exists "custom_sections_delete_admin" on public.custom_sections;

create policy "custom_sections_select_public"
  on public.custom_sections for select
  to anon, authenticated
  using (is_visible = true);

create policy "custom_sections_select_admin"
  on public.custom_sections for select
  using (can_manage_settings());

create policy "custom_sections_insert_admin"
  on public.custom_sections for insert
  with check (can_manage_settings());

create policy "custom_sections_update_admin"
  on public.custom_sections for update
  using (can_manage_settings())
  with check (can_manage_settings());

create policy "custom_sections_delete_admin"
  on public.custom_sections for delete
  using (can_manage_settings());
