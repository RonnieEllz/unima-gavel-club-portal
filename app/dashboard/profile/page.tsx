import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import { canManageOperations } from "@/lib/role-policy";
import type { Profile } from "@/types/database";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = profileData as Profile | null;

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-maroon-800">My Profile</h1>
      <p className="mt-1 text-gray-600">
        Your profile details are managed by the club executive. Contact an administrator if anything needs updating.
      </p>

      <div className="card mt-8 grid grid-cols-2 gap-4 p-6 text-sm">
        <div>
          <p className="text-gray-400">Full Name</p>
          <p className="font-medium text-gray-800">{profile.full_name}</p>
        </div>
        <div>
          <p className="text-gray-400">Program</p>
          <p className="font-medium text-gray-800">{profile.program}</p>
        </div>
        <div>
          <p className="text-gray-400">Year of Study</p>
          <p className="font-medium text-gray-800">{profile.year_of_study}</p>
        </div>
        <div>
          <p className="text-gray-400">Membership Status</p>
          <p className="font-medium capitalize text-gray-800">{profile.membership_status}</p>
        </div>
      </div>

      <ProfileForm
        profile={profile}
        canEdit={canManageOperations((adminRole?.role as Parameters<typeof canManageOperations>[0]) ?? null)}
      />
    </div>
  );
}
