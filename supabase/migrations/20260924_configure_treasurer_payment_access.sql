create or replace function public.can_manage_payments()
returns boolean as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'administrator', 'treasurer')
  );
$$ language sql security definer set search_path = public stable;

create or replace function public.set_member_payment_status(
  target_member_id uuid,
  paid boolean
)
returns jsonb as $$
declare
  previous_data jsonb;
  next_payment_date timestamptz;
begin
  if not public.can_manage_payments() then
    raise exception 'Only an authorized payment administrator can update payment status.';
  end if;

  select jsonb_build_object(
    'payment_verified', payment_verified,
    'last_payment_date', last_payment_date
  )
  into previous_data
  from public.profiles
  where id = target_member_id;

  if previous_data is null then
    raise exception 'Member not found.';
  end if;

  next_payment_date := case when paid then now() else null end;

  update public.profiles
  set payment_verified = paid,
      last_payment_date = next_payment_date
  where id = target_member_id;

  return jsonb_build_object(
    'before', previous_data,
    'after', jsonb_build_object(
      'payment_verified', paid,
      'last_payment_date', next_payment_date
    )
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.get_payment_members(
  search_term text default null,
  paid_filter boolean default null
)
returns table (
  id uuid,
  full_name text,
  program text,
  year_of_study smallint,
  membership_status public.membership_status,
  payment_verified boolean,
  last_payment_date timestamptz
) as $$
  select p.id, p.full_name, p.program, p.year_of_study, p.membership_status,
         p.payment_verified, p.last_payment_date
  from public.profiles p
  where public.can_manage_payments()
    and (
      nullif(trim(search_term), '') is null
      or p.full_name ilike '%' || trim(search_term) || '%'
      or p.program ilike '%' || trim(search_term) || '%'
    )
    and (paid_filter is null or p.payment_verified = paid_filter)
  order by p.full_name asc;
$$ language sql security definer set search_path = public;

revoke all on function public.set_member_payment_status(uuid, boolean) from public;
grant execute on function public.set_member_payment_status(uuid, boolean) to authenticated;

create or replace function public.set_members_payment_status(
  target_member_ids uuid[],
  paid boolean
)
returns table (
  member_id uuid,
  before_data jsonb,
  after_data jsonb
) as $$
declare
  next_payment_date timestamptz;
begin
  if not public.can_manage_payments() then
    raise exception 'Only an authorized payment administrator can update payment status.';
  end if;

  if target_member_ids is null or cardinality(target_member_ids) = 0 then
    raise exception 'Select at least one member.';
  end if;

  if exists (
    select 1
    from unnest(target_member_ids) requested(id)
    left join public.profiles p on p.id = requested.id
    where p.id is null
  ) then
    raise exception 'One or more selected members could not be found.';
  end if;

  next_payment_date := case when paid then now() else null end;

  return query
  with previous as (
    select p.id,
      jsonb_build_object(
        'payment_verified', p.payment_verified,
        'last_payment_date', p.last_payment_date
      ) as before_data
    from public.profiles p
    where p.id = any(target_member_ids)
    for update
  ), updated as (
    update public.profiles p
    set payment_verified = paid,
        last_payment_date = next_payment_date
    from previous
    where p.id = previous.id
    returning p.id, previous.before_data
  )
  select updated.id,
    updated.before_data,
    jsonb_build_object(
      'payment_verified', paid,
      'last_payment_date', next_payment_date
    )
  from updated;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.set_members_payment_status(uuid[], boolean) from public;
grant execute on function public.set_members_payment_status(uuid[], boolean) to authenticated;
revoke all on function public.get_payment_members(text, boolean) from public;
grant execute on function public.get_payment_members(text, boolean) to authenticated;
