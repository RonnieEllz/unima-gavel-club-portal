import { createClient } from "@/lib/supabase/server";
import type { AdminRoleName } from "@/types/database";
import { canManageOperations, hasContentAccess, isSuperAdmin } from "@/lib/role-policy";

export { canManageOperations, hasContentAccess, isSuperAdmin };

export type AuthContext = {
  userId: string;
  role: AdminRoleName | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    role: (adminRole?.role as AdminRoleName | undefined) ?? null,
  };
}
