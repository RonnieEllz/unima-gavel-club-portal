-- Landing page configuration for public copy, CTAs, visibility, and SEO.
create table if not exists landing_page_settings (
  id boolean primary key default true check (id),
  hero_eyebrow text not null default 'University of Malawi',
  hero_title text not null default 'UNIMA Gavel Club',
  hero_description text not null default 'A student community focused on developing communication, public speaking, leadership and confidence.',
  hero_image text,
  primary_cta_label text not null default 'Join the Club',
  primary_cta_url text not null default '/join',
  secondary_cta_label text not null default 'Member Login',
  secondary_cta_url text not null default '/login',
  intro_heading text not null default 'Who we are',
  intro_content text not null default 'The UNIMA Gavel Club brings together students who want to become confident, persuasive and thoughtful communicators. Through regular meetings, prepared speeches, impromptu challenges and leadership roles, our members build the skills that carry into classrooms, interviews and every room they will one day lead.\n\nWhether you are terrified of public speaking or already love the stage, there is a place for you here.',
  intro_image text,
  intro_image_alt text not null default 'Students in discussion on campus',
  show_announcement boolean not null default true,
  show_intro boolean not null default true,
  show_meeting boolean not null default true,
  show_stories boolean not null default true,
  show_updates boolean not null default true,
  show_gallery boolean not null default true,
  seo_title text not null default 'UNIMA Gavel Club | University of Malawi Toastmasters',
  seo_description text not null default 'A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.',
  social_image text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

insert into landing_page_settings (id)
values (true)
on conflict (id) do nothing;

drop trigger if exists landing_page_settings_set_updated_at on landing_page_settings;
create trigger landing_page_settings_set_updated_at
  before update on landing_page_settings
  for each row execute function set_updated_at();

alter table landing_page_settings enable row level security;

drop policy if exists "landing_page_settings_select_public" on landing_page_settings;
drop policy if exists "landing_page_settings_select_admin" on landing_page_settings;
drop policy if exists "landing_page_settings_insert_admin" on landing_page_settings;
drop policy if exists "landing_page_settings_update_admin" on landing_page_settings;
drop policy if exists "site_settings_select_public_announcement" on site_settings;
drop policy if exists "gallery_update_content_admin" on gallery;

create policy "landing_page_settings_select_public"
  on landing_page_settings for select
  to anon, authenticated
  using (true);

create policy "landing_page_settings_select_admin"
  on landing_page_settings for select
  using (can_manage_settings());

create policy "landing_page_settings_insert_admin"
  on landing_page_settings for insert
  with check (can_manage_settings());

create policy "landing_page_settings_update_admin"
  on landing_page_settings for update
  using (can_manage_settings())
  with check (can_manage_settings());

create policy "site_settings_select_public_announcement"
  on site_settings for select
  to anon, authenticated
  using (key = 'announcement_text');

create policy "gallery_update_content_admin"
  on gallery for update
  using (has_content_access())
  with check (has_content_access());
