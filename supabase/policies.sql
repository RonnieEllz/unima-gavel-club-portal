-- =========================================================================
-- Row Level Security Policies
-- Run AFTER schema.sql. This is the real security boundary of the app.
-- the middleware route checks are only a UX convenience.
-- =========================================================================

alter table profiles enable row level security;
alter table admin_roles enable row level security;
alter table meetings enable row level security;
alter table attendance enable row level security;
alter table posts enable row level security;
alter table gallery enable row level security;
alter table site_settings enable row level security;
alter table audit_logs enable row level security;

-- CREATE POLICY has no IF NOT EXISTS form. Remove this script's policies so
-- the file can safely be rerun during setup or policy changes.
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_select_admin" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_update_admin" on profiles;
drop policy if exists "admin_roles_select_admin" on admin_roles;
drop policy if exists "admin_roles_select_own" on admin_roles;
drop policy if exists "admin_roles_insert_super_admin" on admin_roles;
drop policy if exists "admin_roles_update_super_admin" on admin_roles;
drop policy if exists "admin_roles_delete_super_admin" on admin_roles;
drop policy if exists "meetings_select_authenticated" on meetings;
drop policy if exists "meetings_select_anon" on meetings;
drop policy if exists "meetings_insert_admin" on meetings;
drop policy if exists "meetings_update_admin" on meetings;
drop policy if exists "meetings_delete_admin" on meetings;
drop policy if exists "attendance_select_own" on attendance;
drop policy if exists "attendance_select_admin" on attendance;
drop policy if exists "attendance_insert_own_when_open" on attendance;
drop policy if exists "attendance_admin_manage" on attendance;
drop policy if exists "posts_select_published" on posts;
drop policy if exists "posts_select_content_admin" on posts;
drop policy if exists "posts_insert_content_admin" on posts;
drop policy if exists "posts_update_content_admin" on posts;
drop policy if exists "posts_delete_content_admin" on posts;
drop policy if exists "posts_select_published_anon" on posts;
drop policy if exists "gallery_select_authenticated" on gallery;
drop policy if exists "gallery_select_anon" on gallery;
drop policy if exists "gallery_insert_content_admin" on gallery;
drop policy if exists "gallery_delete_content_admin" on gallery;
drop policy if exists "site_settings_select_admin" on site_settings;
drop policy if exists "site_settings_insert_admin" on site_settings;
drop policy if exists "site_settings_update_admin" on site_settings;
drop policy if exists "site_settings_delete_admin" on site_settings;
drop policy if exists "storage_public_read" on storage.objects;
drop policy if exists "storage_content_admin_insert" on storage.objects;
drop policy if exists "storage_content_admin_delete" on storage.objects;
drop policy if exists "storage_own_avatar_insert" on storage.objects;
drop policy if exists "storage_own_avatar_update" on storage.objects;
drop policy if exists "audit_logs_select_admin" on audit_logs;
drop policy if exists "audit_logs_insert_none" on audit_logs;
drop policy if exists "audit_logs_update_none" on audit_logs;
drop policy if exists "audit_logs_delete_none" on audit_logs;

-- ---------------------------------------------------------------------------
-- PROFILES
-- Members: can read + update their own row only, and can never change their
-- own membership_status (that's admin-only, enforced by only granting
-- UPDATE on specific columns via a security-definer function, see note below).
-- Admins: full read of all profiles; update reserved for admins with access.
-- ---------------------------------------------------------------------------
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on profiles for select
  using (can_manage_operations());

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on profiles for update
  using (can_manage_operations())
  with check (can_manage_operations());

-- Note: profiles_update_own lets a member update the whole row at the
-- Postgres layer. Membership_status, program, year etc. that members
-- should NOT self-edit are protected at the APPLICATION layer: the member
-- profile form only ever sends phone_number / holiday_residence /
-- learning_expectations / preferred_placement / avatar_url in its update
-- payload. If you want this enforced in the database too (defence in
-- depth), split profiles into a members-editable table and an
-- admin-only table, or add a BEFORE UPDATE trigger that rejects changes to
-- protected columns unless is_admin().

create or replace function protect_profile_columns()
returns trigger as $$
begin
  if not can_manage_operations() then
     if new.phone_number is distinct from old.phone_number
       or new.holiday_residence is distinct from old.holiday_residence
       or new.learning_expectations is distinct from old.learning_expectations
       or new.preferred_placement is distinct from old.preferred_placement
       or new.membership_status is distinct from old.membership_status
       or new.full_name is distinct from old.full_name
       or new.program is distinct from old.program
       or new.year_of_study is distinct from old.year_of_study
       or new.sex is distinct from old.sex then
      raise exception 'Members cannot edit this field. Contact an administrator.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists profiles_protect_columns on profiles;
create trigger profiles_protect_columns
  before update on profiles
  for each row execute function protect_profile_columns();

-- ---------------------------------------------------------------------------
-- AUDIT LOGS
-- Administrators can read the audit history. Writes are only possible through
-- record_audit_event(), and existing records cannot be changed or removed.
-- ---------------------------------------------------------------------------
create policy "audit_logs_select_admin"
  on audit_logs for select
  using (can_view_audit());

create policy "audit_logs_insert_none"
  on audit_logs for insert
  with check (false);

create policy "audit_logs_update_none"
  on audit_logs for update
  using (false)
  with check (false);

create policy "audit_logs_delete_none"
  on audit_logs for delete
  using (false);

-- ---------------------------------------------------------------------------
-- ADMIN_ROLES
-- Only super admins can view or modify the admin roster.
-- ---------------------------------------------------------------------------
create policy "admin_roles_select_admin"
  on admin_roles for select
  using (is_super_admin());

create policy "admin_roles_select_own"
  on admin_roles for select
  using (auth.uid() = user_id);

create policy "admin_roles_insert_super_admin"
  on admin_roles for insert
  with check (is_super_admin());

create policy "admin_roles_update_super_admin"
  on admin_roles for update
  using (is_super_admin())
  with check (is_super_admin());

create policy "admin_roles_delete_super_admin"
  on admin_roles for delete
  using (is_super_admin());

-- ---------------------------------------------------------------------------
-- MEETINGS
-- Everyone signed in can read meetings. Only admins can create/edit/delete.
-- ---------------------------------------------------------------------------
create policy "meetings_select_authenticated"
  on meetings for select
  to authenticated
  using (true);

-- The landing page shows the next upcoming meeting to anonymous visitors too:
create policy "meetings_select_anon"
  on meetings for select
  to anon
  using (true);

create policy "meetings_insert_admin"
  on meetings for insert
  with check (can_manage_operations());

create policy "meetings_update_admin"
  on meetings for update
  using (can_manage_operations())
  with check (can_manage_operations());

create policy "meetings_delete_admin"
  on meetings for delete
  using (can_manage_operations());

-- ---------------------------------------------------------------------------
-- ATTENDANCE
-- A member can see only their OWN attendance rows.
-- A member can INSERT a check-in only for themself, and only while the
-- meeting's attendance_open flag is true. The unique(member_id, meeting_id)
-- constraint in schema.sql prevents double check-in.
-- Admins can see and manage all attendance.
-- ---------------------------------------------------------------------------
create policy "attendance_select_own"
  on attendance for select
  using (auth.uid() = member_id);

create policy "attendance_select_admin"
  on attendance for select
  using (can_manage_operations());

create policy "attendance_insert_own_when_open"
  on attendance for insert
  with check (
    auth.uid() = member_id
    and is_active_member()
    and exists (
      select 1 from meetings m
      where m.id = meeting_id and m.attendance_open = true
    )
  );

create policy "attendance_admin_manage"
  on attendance for all
  using (can_manage_operations())
  with check (can_manage_operations());

-- ---------------------------------------------------------------------------
-- POSTS (updates & stories)
-- Everyone signed in can read PUBLISHED posts.
-- Admins with content access can read all (including drafts) and write.
-- ---------------------------------------------------------------------------
create policy "posts_select_published"
  on posts for select
  to authenticated
  using (published = true);

create policy "posts_select_content_admin"
  on posts for select
  using (has_content_access());

create policy "posts_insert_content_admin"
  on posts for insert
  with check (has_content_access());

create policy "posts_update_content_admin"
  on posts for update
  using (has_content_access())
  with check (has_content_access());

create policy "posts_delete_content_admin"
  on posts for delete
  using (has_content_access());

-- The landing page shows the latest published stories/updates to anonymous
-- visitors too:
create policy "posts_select_published_anon"
  on posts for select
  to anon
  using (published = true);

-- ---------------------------------------------------------------------------
-- GALLERY
-- Everyone signed in can view. Admins with content access can manage.
-- ---------------------------------------------------------------------------
create policy "gallery_select_authenticated"
  on gallery for select
  to authenticated
  using (true);

-- The landing page shows a gallery preview to anonymous visitors too:
create policy "gallery_select_anon"
  on gallery for select
  to anon
  using (true);

create policy "gallery_insert_content_admin"
  on gallery for insert
  with check (has_content_access());

create policy "gallery_delete_content_admin"
  on gallery for delete
  using (has_content_access());

-- ---------------------------------------------------------------------------
-- SITE SETTINGS
-- ---------------------------------------------------------------------------
create policy "site_settings_select_admin"
  on site_settings for select
  using (can_manage_settings());

create policy "site_settings_insert_admin"
  on site_settings for insert
  with check (can_manage_settings());

create policy "site_settings_update_admin"
  on site_settings for update
  using (can_manage_settings())
  with check (can_manage_settings());

create policy "site_settings_delete_admin"
  on site_settings for delete
  using (can_manage_settings());

-- ---------------------------------------------------------------------------
-- STORAGE POLICIES
-- Run this after creating a public bucket named "gallery" and "covers" in
-- Supabase Storage (see README "Creating the Supabase project").
-- ---------------------------------------------------------------------------
-- Public read access to images (site displays photos to logged-in members
-- and, optionally, anonymous visitors on the landing page):
create policy "storage_public_read"
  on storage.objects for select
  using (bucket_id in ('gallery', 'covers', 'avatars'));

-- Only content admins can upload/delete gallery & cover images:
create policy "storage_content_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id in ('gallery', 'covers') and has_content_access()
  );

create policy "storage_content_admin_delete"
  on storage.objects for delete
  using (
    bucket_id in ('gallery', 'covers') and has_content_access()
  );

-- Members can upload their own avatar (path convention: avatars/{user_id}/*)
create policy "storage_own_avatar_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_own_avatar_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
