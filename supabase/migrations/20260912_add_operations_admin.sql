-- Add the operations-only administrator role to an existing Supabase project.
-- This file intentionally contains only the enum change. PostgreSQL must
-- commit the new enum value before another migration can reference it.

alter type admin_role add value if not exists 'operations_admin';
