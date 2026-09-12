import Link from "next/link";
import {
  getCurrentUserProfile,
  getMemberAttendanceHistory,
  getActiveSemesterMeetings,
  getLatestPosts,
} from "@/lib/data";
import { calculateOperationalSummary } from "@/lib/operational-status";
import UpdateCard from "@/components/UpdateCard";
import StoryCard from "@/components/StoryCard";
import type { Profile } from "@/types/database";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const current = await getCurrentUserProfile();
  const user = current.user;
  const profile = current.profile as Profile | null;
  const [history, semesterMeetings, updates, stories] = await Promise.all([
    user ? getMemberAttendanceHistory(user.id) : Promise.resolve([]),
    getActiveSemesterMeetings(),
    getLatestPosts("update", 2),
    getLatestPosts("story", 2),
  ]);

  const presentCount = history.length;
  const operationalSummary = profile && profile.membership_status === "active"
    ? calculateOperationalSummary({
        membershipStatus: profile.membership_status,
        membershipActivatedAt: profile.membership_activated_at,
        meetings: semesterMeetings,
        attendedMeetingIds: history.map((record) => record.meeting_id),
      })
    : null;

  return (
    <div className="space-y-10">
      <section className="card grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(20rem,1.4fr)] md:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">
            Welcome, {profile?.full_name?.split(" ")[0] ?? "Member"}!
          </h1>
          <p className="mt-1 text-gray-600">
            {profile?.program} · Year {profile?.year_of_study}
          </p>
          {operationalSummary && (
            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[operationalSummary.status]}`}>
              Operational {operationalSummary.status === "review" ? "review required" : operationalSummary.status}
            </span>
          )}
          {profile && (
            <span className={`ml-2 mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${profile.payment_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {profile.payment_verified ? "Membership paid" : "Membership unpaid"}
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 sm:justify-center">
            <p className="text-2xl font-bold text-maroon-700">{operationalSummary?.attendedCount ?? presentCount}</p>
            <p className="text-sm text-gray-500">Meetings Attended This Semester</p>
          </div>
          <div className="flex items-center rounded-lg bg-gray-50 px-4 py-3 sm:justify-center">
            <Link href="/dashboard/attendance" className="text-sm font-semibold text-maroon-700 hover:underline">
              View Full Attendance History →
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-bold text-maroon-800">Latest Updates</h2>
          <div className="mt-4 space-y-3">
            {updates.length > 0 ? (
              updates.map((u) => <UpdateCard key={u.id} post={u} />)
            ) : (
              <p className="text-sm text-gray-500">No updates yet.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-maroon-800">Latest Stories</h2>
          <div className="mt-4 grid gap-4">
            {stories.length > 0 ? (
              stories.map((s) => <StoryCard key={s.id} post={s} />)
            ) : (
              <p className="text-sm text-gray-500">No stories yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
