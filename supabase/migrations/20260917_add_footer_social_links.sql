alter table public.landing_page_settings
  add column if not exists footer_instagram_url text,
  add column if not exists footer_tiktok_url text;
