-- =========================================================================
-- Bootstrap your first Super Admin.
--
-- Run this ONCE, after you have registered a normal account through the
-- website with the email you want to be Super Admin.
--
-- 1. Register normally at /join (or sign up via Supabase Auth).
-- 2. Find that user's id: Supabase Dashboard -> Authentication -> Users.
-- 3. Paste the id below and run this in the SQL Editor.
-- =========================================================================

begin;

-- Make auth.uid() resolve to the account being bootstrapped while this
-- transaction runs. This lets the profile protection trigger recognize the
-- newly inserted super-admin role in the SQL Editor session.
select set_config('request.jwt.claim.sub', 'PASTE-USER-UUID-HERE', true);

insert into admin_roles (user_id, role)
values ('PASTE-USER-UUID-HERE', 'super_admin')
on conflict (user_id) do update set role = excluded.role;

-- Also mark them as an active member so they see the normal member
-- dashboard correctly if they navigate there:
update profiles set membership_status = 'active' where id = 'PASTE-USER-UUID-HERE';

commit;
