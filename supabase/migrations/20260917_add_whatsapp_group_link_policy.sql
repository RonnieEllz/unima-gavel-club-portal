drop policy if exists "site_settings_select_public_whatsapp_group_link" on site_settings;

create policy "site_settings_select_public_whatsapp_group_link"
  on site_settings for select
  to anon, authenticated
  using (key = 'whatsapp_group_link');
