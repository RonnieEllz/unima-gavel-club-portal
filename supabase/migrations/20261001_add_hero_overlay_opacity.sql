alter table public.landing_page_settings
  add column if not exists hero_overlay_opacity integer not null default 100
  check (hero_overlay_opacity between 0 and 100);

notify pgrst, 'reload schema';