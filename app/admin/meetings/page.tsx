import { createClient } from "@/lib/supabase/server";
import type { Meeting } from "@/types/database";
import MeetingForm from "./MeetingForm";
import MeetingRowActions from "./MeetingRowActions";

export default async function AdminMeetingsPage({
  searchParams,
}: {
  searchParams: { view?: string; q?: string };
}) {
  const supabase = createClient();
  const view = searchParams.view === "past" || searchParams.view === "all" ? searchParams.view : "upcoming";
  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  let meetingsQuery = supabase
    .from("meetings")
    .select("*")
    .order("date", { ascending: view === "past" })
    .order("time", { ascending: view === "past" });
  const today = new Date().toISOString().slice(0, 10);
  if (view === "upcoming") meetingsQuery = meetingsQuery.gte("date", today);
  if (view === "past") meetingsQuery = meetingsQuery.lt("date", today);
  if (q) meetingsQuery = meetingsQuery.or(`title.ilike.%${q}%,venue.ilike.%${q}%,description.ilike.%${q}%`);
  const { data: meetingData, error } = await meetingsQuery;
  const meetings = (meetingData as Meeting[] | null) ?? [];
  const { data: attendanceData } = meetings.length
    ? await supabase.from("attendance").select("meeting_id").in("meeting_id", meetings.map((meeting) => meeting.id))
    : { data: [] };
  const attendanceCounts = new Map<string, number>();
  for (const record of attendanceData ?? []) attendanceCounts.set(record.meeting_id, (attendanceCounts.get(record.meeting_id) ?? 0) + 1);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Meetings</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Meetings could not be loaded. Please try again.
        </p>
      )}

      <MeetingForm />

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4">
        <input name="q" defaultValue={q} placeholder="Search title, venue, description..." className="input-field min-w-[16rem] flex-1" />
        <select name="view" defaultValue={view} className="input-field max-w-[10rem]">
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All meetings</option>
        </select>
        <button className="btn-secondary !px-4 !py-2 text-sm">Filter</button>
        <a href="/admin/meetings" className="btn-secondary !px-4 !py-2 text-sm">Clear</a>
      </form>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Date / Time</th>
              <th className="px-4 py-3 font-semibold">Venue</th>
              <th className="px-4 py-3 font-semibold">Attendance</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {meetings.length > 0 ? meetings.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{m.title}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(m.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })} · {m.time}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.venue}</td>
                <td className="px-4 py-3">
                  <span className="mr-3 text-gray-600">{attendanceCounts.get(m.id) ?? 0} present</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      m.attendance_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.attendance_open ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a href={`/admin/attendance?meeting=${m.id}`} className="mr-3 text-xs font-semibold text-maroon-700 hover:underline">Attendance</a>
                  <MeetingRowActions meeting={m} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No meetings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
