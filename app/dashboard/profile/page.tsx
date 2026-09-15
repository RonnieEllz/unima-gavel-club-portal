import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

      <div className="card mt-8 overflow-hidden">
        <dl className="divide-y divide-gray-100 text-sm">
          {[
            ["Full Name", profile.full_name],
            ["Program", profile.program],
            ["Year of Study", String(profile.year_of_study)],
            ["Membership Status", profile.membership_status],
            ["Phone Number", profile.phone_number || "Not provided"],
            ["Holiday Residence", profile.holiday_residence || "Not provided"],
            ["Learning Expectations", profile.learning_expectations || "Not provided"],
            ["Preferred Placement", profile.preferred_placement || "Not provided"],
            ["Membership Payment", profile.payment_verified ? "Paid" : "Unpaid"],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)] sm:gap-6">
              <dt className="font-semibold text-gray-500">{label}</dt>
              <dd className="whitespace-pre-wrap font-medium capitalize text-gray-800">{value}</dd>
            </div>
          ))}
          {operationalSummary && (
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)] sm:gap-6">
              <dt className="font-semibold text-gray-500">Operational Status</dt>
              <dd className="font-medium capitalize text-gray-800">
                {operationalSummary.status === "review" ? "Review required" : operationalSummary.status}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {operationalSummary.attendedCount} attended · {operationalSummary.missedCount} missed this semester
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
