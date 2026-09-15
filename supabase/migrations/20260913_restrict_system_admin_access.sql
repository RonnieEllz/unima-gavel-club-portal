-- Restrict audit history to Super Admin and Administrator.
create or replace function public.can_view_audit()
returns boolean as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator')
  );
$$ language sql security definer set search_path = public stable;
