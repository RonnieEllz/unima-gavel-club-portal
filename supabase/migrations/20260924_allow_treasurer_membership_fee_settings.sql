-- Allow payment administrators to manage only membership fee account settings.
-- This keeps general site settings restricted to settings admins while allowing
-- treasurers to maintain the membership payment account details.

drop policy if exists "site_settings_select_admin" on public.site_settings;
drop policy if exists "site_settings_insert_admin" on public.site_settings;
drop policy if exists "site_settings_update_admin" on public.site_settings;
drop policy if exists "site_settings_delete_admin" on public.site_settings;

create policy "site_settings_select_admin"
  on public.site_settings for select
  using (
    can_manage_settings()
    or (can_manage_payments() and key like 'membership_fee_%')
  );

create policy "site_settings_insert_admin"
  on public.site_settings for insert
  with check (
    can_manage_settings()
    or (can_manage_payments() and key like 'membership_fee_%')
  );

create policy "site_settings_update_admin"
  on public.site_settings for update
  using (
    can_manage_settings()
    or (can_manage_payments() and key like 'membership_fee_%')
  )
  with check (
    can_manage_settings()
    or (can_manage_payments() and key like 'membership_fee_%')
  );

create policy "site_settings_delete_admin"
  on public.site_settings for delete
  using (
    can_manage_settings()
    or (can_manage_payments() and key like 'membership_fee_%')
  );
