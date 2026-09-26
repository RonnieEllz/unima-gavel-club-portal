import { createClient } from "@/lib/supabase/server";
import type { Meeting } from "@/types/database";
import { AddAttendanceForm, RemoveAttendanceButton } from "./AttendanceCorrectionControls";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: { meeting?: string };
}) {
  const supabase = createClient();
  const activeSemester = await supabase.from("semesters").select("id").eq("is_active", true).maybeSingle();
  const activeSemesterId = activeSemester.data?.id ?? null;
  const { data: meetingData, error: meetingsError } = activeSemesterId
    ? await supabase
        .from("meetings")
        .select("id, title, date")
        .eq("semester_id", activeSemesterId)
        .order("date", { ascending: false })
    : { data: [], error: null };
  const meetings = meetingData as Pick<Meeting, "id" | "title" | "date">[] | null;

  const { data: memberData } = await supabase
    .from("profiles")
    .select("id, full_name, program")
    .eq("membership_status", "active")
    .order("full_name");
  const members = memberData ?? [];

  const selectedMeetingId = searchParams.meeting || meetings?.[0]?.id;

  const { data: records, error: recordsError } = selectedMeetingId
    ? await supabase
        .from("attendance")
        .select("id, checked_in_at, profiles(id, full_name, program, year_of_study)")
        .eq("meeting_id", selectedMeetingId)
        .order("checked_in_at", { ascending: true })
    : { data: [] };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-maroon-800">Attendance</h1>
        {selectedMeetingId && (
          <a href={`/api/export/attendance?meeting=${selectedMeetingId}`} className="btn-secondary !px-4 !py-2 text-sm">
            Export CSV
          </a>
        )}
      </div>

      {(meetingsError || recordsError) && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Attendance data could not be loaded. Please try again.
        </p>
      )}

      <form method="get" className="mt-6 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <label htmlFor="meeting" className="label-field">Meeting</label>
        <select
          id="meeting"
          name="meeting"
          defaultValue={selectedMeetingId}
          className="input-field max-w-md"
          disabled={!meetings || meetings.length === 0}
        >
          {meetings && meetings.length > 0 ? meetings.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} -{" "}
              {new Date(m.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
            </option>
          )) : <option>No meetings available</option>}
        </select>
        </div>
        <button type="submit" disabled={!meetings || meetings.length === 0} className="btn-secondary !px-4 !py-2 text-sm">
          View Attendance
        </button>
      </form>

      {selectedMeetingId && <AddAttendanceForm meetingId={selectedMeetingId} members={members} />}

      {selectedMeetingId && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5"><p className="text-3xl font-bold text-maroon-700">{records?.length ?? 0}</p><p className="mt-1 text-sm text-gray-500">Present</p></div>
          <div className="card p-5"><p className="text-3xl font-bold text-maroon-700">{members.length}</p><p className="mt-1 text-sm text-gray-500">Active members</p></div>
          <div className="card p-5"><p className="text-3xl font-bold text-maroon-700">{members.length ? Math.round(((records?.length ?? 0) / members.length) * 100) : 0}%</p><p className="mt-1 text-sm text-gray-500">Attendance rate</p></div>
        </div>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Program / Year</th>
              <th className="px-4 py-3 font-semibold">Checked In At</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records && records.length > 0 ? (
              records.map((r: any) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.profiles?.program} · Yr {r.profiles?.year_of_study}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(r.checked_in_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3"><RemoveAttendanceButton attendanceId={r.id} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No check-ins recorded for this meeting yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
