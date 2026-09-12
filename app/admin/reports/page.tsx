import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
  let meetings: { id: string; title: string; date: string; time: string; venue: string }[] = [];
  let attendance: { id: string; meeting_id: string; member_id: string; checked_in_at: string }[] = [];
  let eligibleMembers: { id: string }[] = [];
  let error = false;

  if (!invalidRange) {
    let membersQuery = supabase.from("profiles").select("id").eq("membership_status", "active");
    if (program) membersQuery = membersQuery.ilike("program", `%${program}%`);
    if (Number.isInteger(year) && year >= 1 && year <= 5) membersQuery = membersQuery.eq("year_of_study", year);
    const membersResult = await membersQuery;
    if (membersResult.error) error = true;
    eligibleMembers = (membersResult.data ?? []) as typeof eligibleMembers;

    let meetingsQuery = supabase
      .from("meetings")
      .select("id, title, date, time, venue")
      .order("date", { ascending: false })
      .order("time", { ascending: false });
    if (from) meetingsQuery = meetingsQuery.gte("date", from);
    if (to) meetingsQuery = meetingsQuery.lt("date", nextDate(to));
    if (q) meetingsQuery = meetingsQuery.or(`title.ilike.%${q}%,venue.ilike.%${q}%,description.ilike.%${q}%`);

    const meetingsResult = await meetingsQuery;
    meetings = (meetingsResult.data ?? []) as typeof meetings;
    error = error || Boolean(meetingsResult.error);

    if (meetings.length > 0) {
      const attendanceResult = await supabase
        .from("attendance")
        .select("id, meeting_id, member_id, checked_in_at")
        .in("meeting_id", meetings.map((meeting) => meeting.id))
        .order("checked_in_at", { ascending: false });
      attendance = (attendanceResult.data ?? []) as typeof attendance;
      error = error || Boolean(attendanceResult.error);
    }
  }

  const counts = new Map<string, number>();
  for (const record of attendance) counts.set(record.meeting_id, (counts.get(record.meeting_id) ?? 0) + 1);
  const presentMemberIds = new Set(attendance.map((record) => record.member_id));
  const zeroAttendance = Math.max(0, eligibleMembers.length - presentMemberIds.size);
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

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4">
        <input name="program" defaultValue={program} placeholder="Program" className="input-field max-w-[12rem]" />
        <select name="year" defaultValue={searchParams.year} className="input-field max-w-[9rem]">
          <option value="">All years</option>
          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Year {value}</option>)}
        </select>
        <input name="q" defaultValue={q} placeholder="Search meeting" className="input-field max-w-[14rem]" />
        <button className="btn-secondary !px-4 !py-2 text-sm">Filter</button>
        <Link href="/admin/reports" className="btn-secondary !px-4 !py-2 text-sm">Clear</Link>
      </form>

      {invalidRange && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">The start date cannot be after the end date.</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">Attendance data could not be loaded.</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[ ["Meetings", meetings.length], ["Total check-ins", attendance.length], ["Current active members", eligibleMembers.length], ["Current active zero-attendance", zeroAttendance], ["Average check-ins", meetings.length ? Math.round(attendance.length / meetings.length) : 0] ].map(([label, value]) => (
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
