import Link from "next/link";
import {
  getCurrentUserProfile,
  getMemberAttendanceHistory,
  getActiveSemesterMeetings,
  getUpcomingMeetings,
  getLatestPosts,
  getWhatsAppGroupLink,
} from "@/lib/data";
import { calculateOperationalSummary } from "@/lib/operational-status";
import UpdateCard from "@/components/UpdateCard";
import StoryCard from "@/components/StoryCard";
import MeetingCard from "@/components/MeetingCard";
import AchievementBadges from "@/components/AchievementBadges";
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
  const [history, semesterMeetings, upcomingMeetings, updates, stories, whatsappGroupLink] = await Promise.all([
    user ? getMemberAttendanceHistory(user.id) : Promise.resolve([]),
    getActiveSemesterMeetings(),
    getUpcomingMeetings(1),
    getLatestPosts("update", 2),
    getLatestPosts("story", 2),
    getWhatsAppGroupLink(),
  ]);

  const semesterMeetingIds = new Set(semesterMeetings.map((meeting) => meeting.id));
  const today = new Date().toISOString().slice(0, 10);
  const completedSemesterMeetingCount = semesterMeetings.filter((meeting) => meeting.date < today).length;
  const presentCount = history.filter((record) => semesterMeetingIds.has(record.meeting_id)).length;
  const checkedInMeetingIds = new Set(history.map((record) => record.meeting_id));
  const nextMeeting = upcomingMeetings[0] ?? null;
  const nextMeetingAlreadyCheckedIn = nextMeeting ? checkedInMeetingIds.has(nextMeeting.id) : false;
  const isNewMember = profile?.membership_status === "pending";
  const showWhatsAppCallout = !!whatsappGroupLink && isNewMember;
  const operationalSummary = profile && profile.membership_status === "active"
    ? calculateOperationalSummary({
        membershipStatus: profile.membership_status,
        membershipActivatedAt: profile.membership_activated_at,
        meetings: semesterMeetings,
        attendedMeetingIds: history.map((record) => record.meeting_id),
      })
    : null;

  return (
    <div className="space-y-6 sm:space-y-10">
      <section className="card grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(20rem,1.4fr)] md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-maroon-800 sm:text-3xl">
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
          <div className="mt-3 inline-flex items-baseline gap-2 rounded-lg bg-gray-50 px-3 py-2 sm:mt-5">
            <span className="text-xl font-bold text-maroon-700">{operationalSummary?.attendedCount ?? presentCount}</span>
            <span className="text-sm font-medium text-gray-700">
              {((operationalSummary?.attendedCount ?? presentCount) === 1) ? "meeting" : "meetings"} attended
            </span>
            <span className="text-xs text-gray-500">this semester</span>
          </div>
        </div>
        <div>
          <AchievementBadges attendedCount={operationalSummary?.attendedCount ?? presentCount} completedMeetingCount={completedSemesterMeetingCount} sex={profile?.sex ?? "male"} />
        </div>
      </section>

      <section aria-labelledby="quick-actions-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 id="quick-actions-heading" className="font-display text-lg font-bold text-maroon-800 sm:text-xl">Quick actions</h2>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3">
          <Link href="/dashboard/meetings" className="card px-2 py-2.5 text-center text-xs font-semibold text-maroon-700 transition hover:border-maroon-300 hover:bg-maroon-50 sm:px-4 sm:py-3 sm:text-sm">View meetings</Link>
          <Link href="/dashboard/attendance" className="card px-2 py-2.5 text-center text-xs font-semibold text-maroon-700 transition hover:border-maroon-300 hover:bg-maroon-50 sm:px-4 sm:py-3 sm:text-sm">View attendance</Link>
          <Link href="/dashboard/profile" className="card px-2 py-2.5 text-center text-xs font-semibold text-maroon-700 transition hover:border-maroon-300 hover:bg-maroon-50 sm:px-4 sm:py-3 sm:text-sm">View profile</Link>
          <Link href="/updates" className="card px-2 py-2.5 text-center text-xs font-semibold text-maroon-700 transition hover:border-maroon-300 hover:bg-maroon-50 sm:px-4 sm:py-3 sm:text-sm">Read updates</Link>
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4" aria-labelledby="next-meeting-heading">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="next-meeting-heading" className="font-display text-lg font-bold text-maroon-800 sm:text-xl">Next Meeting</h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">Keep up with the club calendar.</p>
          </div>
        </div>
        {nextMeeting ? (
          <MeetingCard
            meeting={nextMeeting}
            alreadyCheckedIn={nextMeetingAlreadyCheckedIn}
            showCheckIn
            canCheckIn={profile?.membership_status === "active"}
          />
        ) : !isNewMember ? (
          <div className="card flex flex-col gap-3 p-5">
            <h3 className="font-semibold text-maroon-800">Join the club community</h3>
            <p className="text-sm text-gray-600">No meeting has been scheduled yet for this period. You can still join the member WhatsApp group and stay connected.</p>
            {whatsappGroupLink ? (
              <a href={whatsappGroupLink} target="_blank" rel="noreferrer noopener" className="inline-flex w-fit items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                Join WhatsApp group
              </a>
            ) : (
              <p className="text-sm text-gray-500">There is currently no WhatsApp group link configured for members.</p>
            )}
          </div>
        ) : null}

        {showWhatsAppCallout && whatsappGroupLink && (
          <div className="card flex flex-col gap-3 p-5">
            <h3 className="font-semibold text-maroon-800">Welcome new member</h3>
            <p className="text-sm text-gray-600">Join the WhatsApp group to stay connected with the club, hear updates, and get support as you begin your journey with UNIMA Gavel Club.</p>
            <a href={whatsappGroupLink} target="_blank" rel="noreferrer noopener" className="inline-flex w-fit items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
              Join WhatsApp group
            </a>
          </div>
        )}
      </section>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-maroon-800 sm:text-xl">Latest Updates</h2>
            <Link href="/updates" className="text-xs font-semibold text-maroon-700 hover:underline sm:text-sm">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {updates.length > 0 ? (
              updates.map((u) => <UpdateCard key={u.id} post={u} />)
            ) : (
              <p className="text-sm text-gray-500">No updates yet.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-maroon-800 sm:text-xl">Latest Stories</h2>
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
