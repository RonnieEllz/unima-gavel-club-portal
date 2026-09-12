-- Configure permissions after 20260912_add_operations_admin.sql has committed.

create or replace function can_manage_operations()
returns boolean as $$
  select exists (
    select 1 from admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator', 'operations_admin')
  );
$$ language sql security definer set search_path = public stable;

create or replace function can_manage_settings()
returns boolean as $$
  select exists (
    select 1 from admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator')
  );
$$ language sql security definer set search_path = public stable;

create or replace function can_view_audit()
returns boolean as $$
  select exists (
    select 1 from admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator', 'content_administrator')
  );
$$ language sql security definer set search_path = public stable;

do $$
begin
  if to_regclass('public.audit_logs') is not null then
    execute 'drop policy if exists "audit_logs_select_admin" on audit_logs';
    execute 'create policy "audit_logs_select_admin" on audit_logs for select using (can_view_audit())';
  end if;

  if to_regclass('public.site_settings') is not null then
    execute 'drop policy if exists "site_settings_select_admin" on site_settings';
    execute 'create policy "site_settings_select_admin" on site_settings for select using (can_manage_settings())';
    execute 'drop policy if exists "site_settings_insert_admin" on site_settings';
    execute 'create policy "site_settings_insert_admin" on site_settings for insert with check (can_manage_settings())';
    execute 'drop policy if exists "site_settings_update_admin" on site_settings';
    execute 'create policy "site_settings_update_admin" on site_settings for update using (can_manage_settings()) with check (can_manage_settings())';
    execute 'drop policy if exists "site_settings_delete_admin" on site_settings';
    execute 'create policy "site_settings_delete_admin" on site_settings for delete using (can_manage_settings())';
  end if;
end;
$$;
