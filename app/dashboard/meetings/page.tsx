import { createClient } from "@/lib/supabase/server";
import CheckInButton from "./CheckInButton";
import { canAccessOperationalFeatures } from "@/lib/role-policy";
import type { Meeting } from "@/types/database";

export default async function MeetingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_status")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const canCheckIn = canAccessOperationalFeatures(profile?.membership_status ?? null);

  const { data: meetingData, error: meetingsError } = await supabase
    .from("meetings")
    .select("*")
    .order("date", { ascending: false })
    .limit(20);
  const meetings = meetingData as Meeting[] | null;

  const { data: attendanceData } = user
    ? await supabase.from("attendance").select("meeting_id").eq("member_id", user.id)
    : { data: [] };
  const myAttendance = attendanceData as { meeting_id: string }[];

  const checkedInSet = new Set((myAttendance ?? []).map((a) => a.meeting_id));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Meetings</h1>
      <p className="mt-1 text-gray-600">Check in when attendance is open for a meeting.</p>

      {meetingsError && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Meetings could not be loaded. Please try again.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {meetings && meetings.length > 0 ? meetings.map((meeting) => (
          <div key={meeting.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-maroon-800">{meeting.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(meeting.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {meeting.time} · {meeting.venue}
              </p>
              {meeting.description && <p className="mt-1 text-sm text-gray-500">{meeting.description}</p>}
            </div>
            <CheckInButton
              meetingId={meeting.id}
              alreadyCheckedIn={checkedInSet.has(meeting.id)}
              attendanceOpen={meeting.attendance_open}
              canCheckIn={canCheckIn}
            />
          </div>
        )) : <p className="text-gray-500">No meetings have been created yet.</p>}
      </div>
    </div>
  );
}
