create or replace function public.can_manage_payments()
returns boolean as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator', 'treasurer')
  );
$$ language sql security definer set search_path = public stable;

create or replace function public.protect_profile_columns()
returns trigger as $$
begin
  if public.can_manage_operations() and not public.can_manage_payments() then
    if new.payment_verified is distinct from old.payment_verified
      or new.last_payment_date is distinct from old.last_payment_date then
      raise exception 'Operations administrators cannot update payment fields.';
    end if;
  elsif public.can_manage_payments() and not public.can_manage_operations() then
    if new.phone_number is distinct from old.phone_number
      or new.holiday_residence is distinct from old.holiday_residence
      or new.learning_expectations is distinct from old.learning_expectations
      or new.preferred_placement is distinct from old.preferred_placement
      or new.membership_status is distinct from old.membership_status
      or new.membership_activated_at is distinct from old.membership_activated_at
      or new.year_of_study is distinct from old.year_of_study
      or new.full_name is distinct from old.full_name
      or new.program is distinct from old.program
      or new.sex is distinct from old.sex
      or new.avatar_url is distinct from old.avatar_url then
      raise exception 'Payment administrators can only update payment fields.';
    end if;
  elsif not public.can_manage_operations() then
    if new.phone_number is distinct from old.phone_number
      or new.holiday_residence is distinct from old.holiday_residence
      or new.learning_expectations is distinct from old.learning_expectations
      or new.preferred_placement is distinct from old.preferred_placement
      or new.membership_status is distinct from old.membership_status
      or new.membership_activated_at is distinct from old.membership_activated_at
      or new.year_of_study is distinct from old.year_of_study
      or new.payment_verified is distinct from old.payment_verified
      or new.last_payment_date is distinct from old.last_payment_date
      or new.full_name is distinct from old.full_name
      or new.program is distinct from old.program
      or new.sex is distinct from old.sex then
      raise exception 'Members cannot edit this field. Contact an administrator.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();
