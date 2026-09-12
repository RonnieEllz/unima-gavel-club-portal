import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/data";

async function count(table: string, match?: Record<string, unknown>) {
  const supabase = createClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (match) {
    for (const [k, v] of Object.entries(match)) query = query.eq(k, v as string | boolean);
  }
  const { count: c } = await query;
  return c ?? 0;
}

export default async function AdminOverviewPage() {
  const { adminRole } = await getCurrentUserProfile();
  const isOperationsAdmin = adminRole === "operations_admin";
  const supabase = createClient();

  if (isOperationsAdmin) {
    const today = new Date().toISOString().slice(0, 10);
    const [{ count: pendingCount }, { data: pendingMembers }, { data: upcomingMeeting }, { count: activeCount }, { count: recentAttendance }, { data: recentMeetings }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("membership_status", "pending"),
      supabase.from("profiles").select("id, full_name, program, year_of_study").eq("membership_status", "pending").order("full_name").limit(5),
      supabase
        .from("meetings")
        .select("id, title, date, time, venue, attendance_open")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("membership_status", "active"),
      supabase.from("attendance").select("id", { count: "exact", head: true }).gte("checked_in_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("meetings")
        .select("id, title, date, time, venue, attendance_open")
        .order("date", { ascending: false })
        .limit(5),
    ]);

    const recentMeetingIds = (recentMeetings ?? []).map((meeting) => meeting.id);
    const attendanceCountsResult = recentMeetingIds.length
      ? await supabase.from("attendance").select("meeting_id").in("meeting_id", recentMeetingIds)
      : { data: [] as { meeting_id: string }[] };

    const attendanceByMeeting = new Map<string, number>();
    for (const record of attendanceCountsResult.data ?? []) {
      attendanceByMeeting.set(record.meeting_id, (attendanceByMeeting.get(record.meeting_id) ?? 0) + 1);
    }

    const recentMeetingSummary = (recentMeetings ?? []).map((meeting) => ({
      ...meeting,
      attendanceCount: attendanceByMeeting.get(meeting.id) ?? 0,
    }));

    const lowTurnout = recentMeetingSummary
      .filter((meeting) => (activeCount ?? 0) > 0)
      .map((meeting) => ({
        ...meeting,
        percentage: Math.round((meeting.attendanceCount / (activeCount ?? 1)) * 100),
      }))
      .filter((meeting) => meeting.percentage < 50)
      .slice(0, 3);

    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-maroon-800">Operations Dashboard</h1>
            <p className="mt-1 text-gray-600">Your daily queue for members, meetings, and attendance.</p>
          </div>
          <Link href="/api/export/members" className="btn-secondary !px-4 !py-2 text-sm">Export members</Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pending approvals", pendingCount ?? 0, "/admin/members?status=pending"],
            ["Active members", activeCount ?? 0, "/admin/members?status=active"],
            ["Recent check-ins", recentAttendance ?? 0, "/admin/attendance"],
            ["Upcoming meeting", upcomingMeeting ? "Scheduled" : "None", "/admin/meetings"],
          ].map(([label, value, href]) => (
            <Link key={label} href={href as string} className="card p-6 transition hover:border-maroon-200 hover:shadow-md">
              <p className="text-3xl font-bold text-maroon-700">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-maroon-800">Next meeting</h2>
                {upcomingMeeting ? (
                  <>
                    <p className="mt-3 font-semibold text-gray-800">{upcomingMeeting.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{upcomingMeeting.date} at {upcomingMeeting.time} · {upcomingMeeting.venue}</p>
                    <p className="mt-3 text-sm font-semibold text-gray-600">Check-in: {upcomingMeeting.attendance_open ? "Open" : "Closed"}</p>
                  </>
                ) : <p className="mt-3 text-sm text-gray-500">No upcoming meeting is scheduled.</p>}
              </div>
              {upcomingMeeting && <Link href={`/admin/attendance?meeting=${upcomingMeeting.id}`} className="text-sm font-semibold text-maroon-700 hover:underline">Attendance</Link>}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl font-bold text-maroon-800">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/admin/members?status=pending" className="btn-primary !px-4 !py-2 text-sm">Review members</Link>
              <Link href="/admin/meetings" className="btn-secondary !px-4 !py-2 text-sm">Manage meetings</Link>
              <Link href="/admin/reports" className="btn-secondary !px-4 !py-2 text-sm">View reports</Link>
              <Link href="/admin/reports" className="btn-secondary !px-4 !py-2 text-sm">Attendance reports</Link>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-display text-xl font-bold text-maroon-800">Needs attention</h2>
            <div className="mt-4 space-y-4">
              {lowTurnout.length > 0 ? (
                lowTurnout.map((meeting) => (
                  <div key={meeting.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-800">{meeting.title}</p>
                      <span className="text-xs font-semibold text-amber-700">{meeting.percentage}%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{meeting.date} · {meeting.attendanceCount} check-ins</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No low-turnout meetings in the recent set.</p>
              )}

              {pendingMembers && pendingMembers.length > 0 && (
                <div className="rounded-md border border-maroon-200 bg-maroon-50 p-3">
                  <p className="font-semibold text-maroon-800">Pending approvals</p>
                  <div className="mt-2 space-y-2">
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                        <span>{member.full_name}</span>
                        <span className="text-gray-500">{member.program} · Yr {member.year_of_study}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl font-bold text-maroon-800">Recent meetings</h2>
            <div className="mt-4 space-y-3">
              {recentMeetingSummary.map((meeting) => (
                <div key={meeting.id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-800">{meeting.title}</p>
                    <span className="text-xs font-medium text-maroon-700">{meeting.attendanceCount} checked in</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{meeting.date} · {meeting.time} · {meeting.venue}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const [
    totalMembers,
    activeMembers,
    pendingMembers,
    inactiveMembers,
    rejectedMembers,
    totalMeetings,
    totalAttendance,
    publishedUpdates,
    publishedStories,
  ] = await Promise.all([
    count("profiles"),
    count("profiles", { membership_status: "active" }),
    count("profiles", { membership_status: "pending" }),
    count("profiles", { membership_status: "inactive" }),
    count("profiles", { membership_status: "rejected" }),
    count("meetings"),
    count("attendance"),
    count("posts", { post_type: "update", published: true }),
    count("posts", { post_type: "story", published: true }),
  ]);

  const attendanceRate =
    totalMeetings > 0 && activeMembers > 0
      ? Math.round((totalAttendance / (totalMeetings * activeMembers)) * 100)
      : 0;

  const stats = [
    { label: "Total Members", value: totalMembers },
    { label: "Active Members", value: activeMembers },
    { label: "Pending Registrations", value: pendingMembers },
    { label: "Inactive Members", value: inactiveMembers },
    { label: "Rejected Members", value: rejectedMembers },
    { label: "Meetings Held", value: totalMeetings },
    { label: "Attendance Records", value: totalAttendance },
    { label: "Attendance Rate", value: `${attendanceRate}%` },
    { label: "Published Updates", value: publishedUpdates },
    { label: "Published Stories", value: publishedStories },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-6">
            <p className="text-3xl font-bold text-maroon-700">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
