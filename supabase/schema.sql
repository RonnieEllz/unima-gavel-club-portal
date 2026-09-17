  -- =========================================================================
  -- UNIMA Toastmasters Gavel Club Portal - Database Schema
  -- Run this in the Supabase SQL Editor (or via `supabase db push`) BEFORE
  -- policies.sql and seed.sql.
  -- =========================================================================

  -- Extensions ---------------------------------------------------------------
  create extension if not exists "uuid-ossp";

  -- Storage buckets used by gallery uploads, post cover uploads, and avatars.
  -- These inserts are safe to rerun in the Supabase SQL Editor.
  insert into storage.buckets (id, name, public)
  values
    ('gallery', 'gallery', true),
    ('covers', 'covers', true),
    ('avatars', 'avatars', true)
  on conflict (id) do update set public = excluded.public;

  -- ---------------------------------------------------------------------------
  -- ENUM TYPES
  -- ---------------------------------------------------------------------------
  do $$
  begin
    create type membership_status as enum ('pending', 'active', 'inactive', 'rejected', 'alumni');
  exception
    when duplicate_object then null;
  end $$;

  do $$
  begin
    create type member_sex as enum ('male', 'female');
  exception
    when duplicate_object then null;
  end $$;

  do $$
  begin
    create type post_type as enum ('update', 'story');
  exception
    when duplicate_object then null;
  end $$;

  do $$
  begin
    create type admin_role as enum ('super_admin', 'administrator', 'operations_admin', 'content_administrator');
  exception
    when duplicate_object then null;
  end $$;

  do $$
  begin
    create type attendance_status as enum ('present');
  exception
    when duplicate_object then null;
  end $$;

  -- ---------------------------------------------------------------------------
  -- PROFILES
  -- One row per auth.users row (1:1), created automatically on sign-up via
  -- the handle_new_user trigger below.
  -- ---------------------------------------------------------------------------
  create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    program text not null,
    year_of_study smallint not null check (year_of_study between 1 and 6),
    sex member_sex not null,
    phone_number text not null,
    holiday_residence text,
    learning_expectations text,
    preferred_placement text,
    membership_status membership_status not null default 'pending',
    membership_activated_at timestamptz,
    payment_verified boolean not null default false,
    last_payment_date timestamptz,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  comment on table profiles is 'One row per member, keyed 1:1 to auth.users.';

  create table if not exists semesters (
    id uuid primary key default uuid_generate_v4(),
    name text not null check (length(trim(name)) between 2 and 160),
    starts_on date not null,
    ends_on date not null,
    is_active boolean not null default false,
    completed_at timestamptz,
    completed_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    check (ends_on >= starts_on)
  );

  create unique index if not exists semesters_one_active_idx on semesters (is_active) where is_active;

  create table if not exists member_progressions (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid not null references profiles(id) on delete cascade,
    semester_id uuid not null references semesters(id) on delete restrict,
    previous_year smallint not null check (previous_year between 1 and 6),
    next_year smallint check (next_year between 1 and 6),
    previous_status membership_status not null,
    next_status membership_status not null,
    processed_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    unique (member_id, semester_id)
  );

  create index if not exists member_progressions_member_idx on member_progressions(member_id, created_at desc);

  -- ---------------------------------------------------------------------------
  -- ADMIN ROLES
  -- Separate table (not a column on profiles) so role-granting can be tightly
  -- controlled and audited independently of profile self-edits.
  -- ---------------------------------------------------------------------------
  create table if not exists admin_roles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    role admin_role not null,
    granted_by uuid references auth.users(id),
    created_at timestamptz not null default now(),
    unique (user_id)
  );

  -- Append-only record of administrative and security-sensitive changes.
  create table if not exists audit_logs (
    id uuid primary key default uuid_generate_v4(),
    actor_id uuid references auth.users(id) on delete set null,
    action text not null check (length(trim(action)) between 2 and 100),
    entity_type text not null check (length(trim(entity_type)) between 2 and 100),
    entity_id text,
    before_data jsonb,
    after_data jsonb,
    reason text,
    created_at timestamptz not null default now()
  );

  create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);
  create index if not exists audit_logs_actor_idx on audit_logs(actor_id, created_at desc);
  create index if not exists audit_logs_entity_idx on audit_logs(entity_type, entity_id, created_at desc);

  -- ---------------------------------------------------------------------------
  -- MEETINGS
  -- ---------------------------------------------------------------------------
  create table if not exists meetings (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    date date not null,
    time time not null,
    venue text not null,
    description text,
    attendance_open boolean not null default false,
    semester_id uuid references semesters(id) on delete restrict,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
  );

  -- ---------------------------------------------------------------------------
  -- ATTENDANCE
  -- One check-in per member per meeting, enforced at the DB level.
  -- ---------------------------------------------------------------------------
  create table if not exists attendance (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid not null references profiles(id) on delete cascade,
    meeting_id uuid not null references meetings(id) on delete cascade,
    status attendance_status not null default 'present',
    checked_in_at timestamptz not null default now(),
    unique (member_id, meeting_id)
  );

  create index if not exists attendance_member_idx on attendance(member_id);
  create index if not exists attendance_meeting_idx on attendance(meeting_id);

  -- ---------------------------------------------------------------------------
  -- POSTS (Updates & Stories share one table, distinguished by post_type)
  -- ---------------------------------------------------------------------------
  create table if not exists posts (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    short_description text,
    content text not null,
    cover_image text,
    author_id uuid references auth.users(id),
    author_name text,
    post_type post_type not null,
    category text,
    published boolean not null default false,
    is_featured boolean not null default false,
    featured_order integer not null default 0 check (featured_order >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create index if not exists posts_type_idx on posts(post_type, published, created_at desc);

  -- ---------------------------------------------------------------------------
  -- GALLERY
  -- ---------------------------------------------------------------------------
  create table if not exists gallery (
    id uuid primary key default uuid_generate_v4(),
    image_url text not null,
    caption text,
    category text,
    is_featured boolean not null default false,
    featured_order integer not null default 0 check (featured_order >= 0),
    uploaded_by uuid references auth.users(id),
    created_at timestamptz not null default now()
  );

  -- ---------------------------------------------------------------------------
  -- SITE SETTINGS
  -- ---------------------------------------------------------------------------
  create table if not exists site_settings (
    key text primary key,
    value text not null,
    updated_by uuid references auth.users(id),
    updated_at timestamptz not null default now()
  );

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
    about_heading text not null default 'About UNIMA Gavel Club',
    about_content text not null default 'The UNIMA Toastmasters Gavel Club is a student-led community at the University of Malawi built around one goal: helping members become confident, capable communicators and leaders.\n\nThrough regular meetings, prepared and impromptu speeches, evaluation, and rotating leadership roles, members practice real skills in a supportive environment, skills that carry far beyond the meeting room.\n\nWhatever brought you here, whether overcoming a fear of public speaking, sharpening your leadership, or simply finding a community of ambitious peers, there is a place for you at Gavel Club.',
    about_image text,
    about_image_alt text not null default 'Students at a leadership meeting',
    footer_description text not null default 'A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.',
    footer_address text not null default 'University of Malawi, Zomba, Malawi',
    footer_email text not null default 'gavelclub@unima.ac.mw',
    footer_phone_1 text,
    footer_phone_2 text,
    footer_instagram_url text,
    footer_tiktok_url text,
    footer_copyright text not null default 'UNIMA Toastmasters Gavel Club. All rights reserved.',
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

  -- ---------------------------------------------------------------------------
  -- updated_at trigger helper
  -- ---------------------------------------------------------------------------
  create or replace function set_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;

  drop trigger if exists profiles_set_updated_at on profiles;
  create trigger profiles_set_updated_at
    before update on profiles
    for each row execute function set_updated_at();

  drop trigger if exists posts_set_updated_at on posts;
  create trigger posts_set_updated_at
    before update on posts
    for each row execute function set_updated_at();

  drop trigger if exists site_settings_set_updated_at on site_settings;
  create trigger site_settings_set_updated_at
    before update on site_settings
    for each row execute function set_updated_at();

  drop trigger if exists landing_page_settings_set_updated_at on landing_page_settings;
  create trigger landing_page_settings_set_updated_at
    before update on landing_page_settings
    for each row execute function set_updated_at();

  -- ---------------------------------------------------------------------------
  -- Auto-create a profile row when a new auth user signs up.
  -- Registration form passes the extra fields via `options.data` (raw_user_meta_data).
  -- ---------------------------------------------------------------------------
  create or replace function handle_new_user()
  returns trigger as $$
  begin
    insert into public.profiles (
      id, full_name, program, year_of_study, sex, phone_number,
      holiday_residence, learning_expectations, preferred_placement
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'program', ''),
      coalesce((new.raw_user_meta_data->>'year_of_study')::smallint, 1),
      coalesce((new.raw_user_meta_data->>'sex')::member_sex, 'male'),
      coalesce(new.raw_user_meta_data->>'phone_number', ''),
      new.raw_user_meta_data->>'holiday_residence',
      new.raw_user_meta_data->>'learning_expectations',
      new.raw_user_meta_data->>'preferred_placement'
    );
    return new;
  end;
  $$ language plpgsql security definer set search_path = public;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

  -- ---------------------------------------------------------------------------
  -- Helper function used heavily by RLS policies (see policies.sql):
  -- returns true if the currently-authenticated user has ANY admin role.
  -- SECURITY DEFINER + fixed search_path so it can read admin_roles even
  -- though the calling user's own RLS on admin_roles would otherwise block it.
  -- ---------------------------------------------------------------------------
  create or replace function is_admin()
  returns boolean as $$
    select exists (
      select 1 from admin_roles where user_id = auth.uid()
    );
  $$ language sql security definer set search_path = public stable;

  create or replace function is_super_admin()
  returns boolean as $$
    select exists (
      select 1 from admin_roles where user_id = auth.uid() and role = 'super_admin'
    );
  $$ language sql security definer set search_path = public stable;

  create or replace function has_content_access()
  returns boolean as $$
    select exists (
      select 1 from admin_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'administrator', 'content_administrator')
    );
  $$ language sql security definer set search_path = public stable;

  create or replace function can_manage_operations()
  returns boolean as $$
    select exists (
      select 1 from admin_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'administrator', 'operations_admin')
    );
  $$ language sql security definer set search_path = public stable;

  create or replace function can_export_data()
  returns boolean as $$
    select can_manage_operations();
  $$ language sql security definer set search_path = public stable;

  create or replace function can_manage_settings()
  returns boolean as $$
    select exists (
      select 1 from admin_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'administrator')
    );
  $$ language sql security definer set search_path = public stable;

  create or replace function can_manage_semesters()
  returns boolean as $$
    select can_manage_settings();
  $$ language sql security definer set search_path = public stable;

  create or replace function can_view_audit()
  returns boolean as $$
    select exists (
      select 1 from admin_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'administrator')
    );
  $$ language sql security definer set search_path = public stable;

  create or replace function is_active_member()
  returns boolean as $$
    select exists (
      select 1 from profiles
      where id = auth.uid() and membership_status = 'active'
    );
  $$ language sql security definer set search_path = public stable;

  -- Audit writes go through this function so callers cannot impersonate an
  -- actor or modify/delete existing audit records through the client API.
  create or replace function record_audit_event(
    event_action text,
    event_entity_type text,
    event_entity_id text default null,
    event_before_data jsonb default null,
    event_after_data jsonb default null,
    event_reason text default null
  )
  returns uuid as $$
  declare
    audit_id uuid;
  begin
    if not is_admin() then
      raise exception 'Only administrators can record audit events.';
    end if;

    insert into audit_logs (
      actor_id, action, entity_type, entity_id,
      before_data, after_data, reason
    )
    values (
      auth.uid(), event_action, event_entity_type, event_entity_id,
      event_before_data, event_after_data, event_reason
    )
    returning id into audit_id;

    return audit_id;
  end;
  $$ language plpgsql security definer set search_path = public;

  -- Protect the administrator roster even when a caller bypasses the app UI.
  -- The bootstrap SQL runs without an authenticated uid, so these checks only
  -- apply to authenticated mutations made through the application.
  create or replace function protect_admin_roles()
  returns trigger as $$
  begin
    if auth.uid() is not null then
      if tg_op = 'DELETE' and old.user_id = auth.uid() then
        raise exception 'You cannot remove your own administrator access.';
      end if;

      if tg_op = 'DELETE' and old.role = 'super_admin' then
        if (select count(*) from admin_roles where role = 'super_admin') <= 1 then
          raise exception 'The last Super Admin cannot be removed.';
        end if;
      end if;

      if tg_op in ('INSERT', 'UPDATE') then
        if not exists (
          select 1 from profiles
          where id = new.user_id and membership_status = 'active'
        ) then
          raise exception 'Only active members can become administrators.';
        end if;
      end if;
    end if;

    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end;
  $$ language plpgsql security definer set search_path = public;

  drop trigger if exists admin_roles_protect_mutations on admin_roles;
  create trigger admin_roles_protect_mutations
    before insert or update or delete on admin_roles
    for each row execute function protect_admin_roles();
