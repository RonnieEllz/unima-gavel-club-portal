import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import { canManageOperations } from "@/lib/role-policy";
import { getMemberAttendanceHistory, getActiveSemesterMeetings } from "@/lib/data";
import { calculateOperationalSummary } from "@/lib/operational-status";
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

  const [history, semesterMeetings] = await Promise.all([
    getMemberAttendanceHistory(user.id),
    getActiveSemesterMeetings(),
  ]);
  const operationalSummary = profile.membership_status === "active"
    ? calculateOperationalSummary({
        membershipStatus: profile.membership_status,
        membershipActivatedAt: profile.membership_activated_at,
        meetings: semesterMeetings,
        attendedMeetingIds: history.map((record) => record.meeting_id),
      })
    : null;

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
        {operationalSummary && (
          <div>
            <p className="text-gray-400">Operational Status</p>
            <p className="font-medium capitalize text-gray-800">
              {operationalSummary.status === "review" ? "Review required" : operationalSummary.status}
            </p>
            <p className="mt-1 text-xs text-gray-500">{operationalSummary.attendedCount} attended · {operationalSummary.missedCount} missed this semester</p>
          </div>
        )}
        <div>
          <p className="text-gray-400">Membership Payment</p>
          <p className={`font-medium ${profile.payment_verified ? "text-green-700" : "text-gray-600"}`}>
            {profile.payment_verified ? "Paid" : "Unpaid"}
          </p>
          {profile.last_payment_date && (
            <p className="mt-1 text-xs text-gray-500">Last payment: {new Date(profile.last_payment_date).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <ProfileForm
        profile={profile}
        canEdit={canManageOperations((adminRole?.role as Parameters<typeof canManageOperations>[0]) ?? null)}
      />
    </div>
  );
}
