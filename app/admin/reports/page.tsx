import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateOperationalSummary } from "@/lib/operational-status";
import { getActiveSemester, getCurrentUserProfile } from "@/lib/data";
import ReportTools from "./ReportTools";

const validDate = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
const nextDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; program?: string; year?: string; q?: string };
}) {
  const from = validDate(searchParams.from);
  const to = validDate(searchParams.to);
  const program = searchParams.program?.trim().slice(0, 80) ?? "";
  const year = Number(searchParams.year);
  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  const invalidRange = Boolean(from && to && from > to);
  const supabase = createClient();
  const { adminRole } = await getCurrentUserProfile();
  const activeSemester = await getActiveSemester();
  const noActiveSemesterMessage = !activeSemester
    ? "No active semester is configured. Create or activate a semester before running attendance reports."
    : null;
  let meetings: { id: string; title: string; date: string; time: string; venue: string }[] = [];
  let attendance: { id: string; meeting_id: string; member_id: string; checked_in_at: string }[] = [];
  let eligibleMembers: { id: string; membership_activated_at: string | null; payment_verified: boolean }[] = [];
  let errorMessage: string | null = null;

  if (!invalidRange && activeSemester) {
    let membersQuery = supabase.from("profiles").select("id, membership_activated_at, payment_verified").eq("membership_status", "active");
    if (program) membersQuery = membersQuery.ilike("program", `%${program}%`);
    if (Number.isInteger(year) && year >= 1 && year <= 5) membersQuery = membersQuery.eq("year_of_study", year);
    const membersResult = await membersQuery;
    if (membersResult.error) errorMessage = membersResult.error.message;
    eligibleMembers = (membersResult.data ?? []) as typeof eligibleMembers;

    let meetingsQuery = supabase
      .from("meetings")
      .select("id, title, date, time, venue")
      .order("date", { ascending: false })
      .order("time", { ascending: false });
    meetingsQuery = meetingsQuery.eq("semester_id", activeSemester.id);
    if (from) meetingsQuery = meetingsQuery.gte("date", from);
    if (to) meetingsQuery = meetingsQuery.lt("date", nextDate(to));
    if (q) meetingsQuery = meetingsQuery.or(`title.ilike.%${q}%,venue.ilike.%${q}%,description.ilike.%${q}%`);

    const meetingsResult = await meetingsQuery;
    meetings = (meetingsResult.data ?? []) as typeof meetings;
    if (meetingsResult.error) errorMessage = meetingsResult.error.message;

    if (meetings.length > 0) {
      const attendanceResult = await supabase
        .from("attendance")
        .select("id, meeting_id, member_id, checked_in_at")
        .in("meeting_id", meetings.map((meeting) => meeting.id))
        .order("checked_in_at", { ascending: false });
      attendance = (attendanceResult.data ?? []) as typeof attendance;
      if (attendanceResult.error) errorMessage = attendanceResult.error.message;
    }
  }

  const counts = new Map<string, number>();
  for (const record of attendance) counts.set(record.meeting_id, (counts.get(record.meeting_id) ?? 0) + 1);

  const operationalMembers = eligibleMembers.map((member) => {
    const summary = calculateOperationalSummary({
      membershipStatus: "active",
      membershipActivatedAt: member.membership_activated_at,
      meetings,
      attendedMeetingIds: attendance.filter((record) => record.member_id === member.id).map((record) => record.meeting_id),
    });
    return { id: member.id, ...summary };
  });

  const activeCount = operationalMembers.filter((member) => member.status === "active").length;
  const reviewCount = operationalMembers.filter((member) => member.status === "review").length;
  const zeroAttendance = Math.max(0, eligibleMembers.length - new Set(attendance.map((record) => record.member_id)).size);
  const reportParams = new URLSearchParams();
  if (from) reportParams.set("from", from);
  if (to) reportParams.set("to", to);
  if (program) reportParams.set("program", program);
  if (searchParams.year) reportParams.set("year", String(searchParams.year));
  if (q) reportParams.set("q", q);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Attendance Reports</h1>
          <p className="mt-1 text-gray-600">Review attendance by meeting date and export the selected range.</p>
        </div>
      </div>

      {activeSemester && adminRole === "super_admin" && (
        <div className="mt-4 rounded-md border border-maroon-200 bg-maroon-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-maroon-700">Current club term</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">{activeSemester.name}</p>
          <p className="text-xs text-gray-600">{activeSemester.starts_on} to {activeSemester.ends_on}</p>
        </div>
      )}

      <form method="get" className="mt-6 grid gap-3 rounded-md border border-gray-200 bg-white p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-3">
        <input name="program" defaultValue={program} placeholder="Program" className="input-field w-full sm:max-w-[12rem]" />
        <select name="year" defaultValue={searchParams.year} className="input-field w-full sm:max-w-[9rem]">
          <option value="">All years</option>
          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Year {value}</option>)}
        </select>
        <input name="q" defaultValue={q} placeholder="Search meeting" className="input-field w-full sm:max-w-[14rem]" />
        <div className="flex w-full gap-3 sm:w-auto">
          <button className="btn-secondary flex-1 !px-4 !py-2 text-sm sm:flex-none">Filter</button>
          <Link href="/admin/reports" className="btn-secondary flex-1 !px-4 !py-2 text-sm text-center sm:flex-none">Clear</Link>
        </div>
      </form>

      {invalidRange && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">The start date cannot be after the end date.</p>}
      {noActiveSemesterMessage && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{noActiveSemesterMessage}</p>
      )}
      {errorMessage && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Attendance data could not be loaded: {errorMessage}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Meetings", meetings.length],
          ["Total check-ins", attendance.length],
          ["Operationally active", activeCount],
          ["Needs review", reviewCount],
          ["Current active zero-attendance", zeroAttendance],
          ["Average check-ins", meetings.length ? Math.round(attendance.length / meetings.length) : 0],
        ].map(([label, value]) => (
          <div key={label} className="card p-5"><p className="text-3xl font-bold text-maroon-700">{value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></div>
        ))}
      </div>

      <ReportTools
        exportParams={reportParams.toString()}
        meetings={meetings.map((meeting) => ({
          id: meeting.id,
          title: meeting.title,
          date: new Date(`${meeting.date}T00:00:00`).toLocaleDateString(),
          count: counts.get(meeting.id) ?? 0,
        }))}
      />
    </div>
  );
}
