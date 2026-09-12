"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canManageOperations } from "@/lib/role-policy";
import type { AdminRoleName } from "@/types/database";

export type UpdateProfileState = { success?: boolean; error?: string };

// Only these fields are ever sent in the update payload. membership_status,
// full_name, program, year_of_study and sex are intentionally excluded.
// a database trigger (protect_profile_columns) also rejects any attempt to
// change them unless the caller is an admin, as defence in depth.
export async function updateOwnProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRole || !canManageOperations(adminRole.role as AdminRoleName)) {
    return { error: "Only an administrator can change these profile details." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      phone_number: String(formData.get("phone_number") ?? ""),
      holiday_residence: String(formData.get("holiday_residence") ?? ""),
      learning_expectations: String(formData.get("learning_expectations") ?? ""),
      preferred_placement: String(formData.get("preferred_placement") ?? ""),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
