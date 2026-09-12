import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Meeting } from "@/types/database";

export default async function AttendanceHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: records } = await supabase
    .from("attendance")
    .select("id, checked_in_at, meetings(id, title, date)")
    .eq("member_id", user.id)
    .order("checked_in_at", { ascending: false });

  const { data: meetingData } = await supabase
    .from("meetings")
    .select("id, title, date")
    .lte("date", new Date().toISOString().slice(0, 10))
    .order("date", { ascending: false });
  const allMeetings = meetingData as Pick<Meeting, "id" | "title" | "date">[] | null;

  const attendedMeetingIds = new Set((records ?? []).map((r: any) => r.meetings?.id));

  const rows = (allMeetings ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    date: m.date,
    status: attendedMeetingIds.has(m.id) ? "Present" : "Absent",
  }));

  const presentCount = rows.filter((r) => r.status === "Present").length;
  const absentCount = rows.length - presentCount;
  const rate = rows.length > 0 ? Math.round((presentCount / rows.length) * 100) : 0;
  const presentAngle = rows.length > 0 ? (presentCount / rows.length) * 360 : 0;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">My Attendance</h1>
      <p className="mt-1 text-gray-600">
        {presentCount} of {rows.length} past meetings attended ({rate}%).
      </p>

      <section className="card mt-8 flex flex-col items-center gap-6 p-6 sm:flex-row">
        <div
          className="attendance-donut-in relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#60a5fa 0deg ${presentAngle}deg, #dc2626 ${presentAngle}deg 360deg)`,
          }}
          role="img"
          aria-label={`${presentCount} present and ${absentCount} absent out of ${rows.length} past meetings`}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-maroon-800">{rate}%</span>
            <span className="text-xs text-gray-500">present</span>
          </div>
        </div>
        <div className="attendance-summary-in w-full max-w-xs">
          <h2 className="font-display text-xl font-bold text-maroon-800">Attendance Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-700">
                <span className="h-3 w-3 rounded-full bg-blue-400" aria-hidden="true" />
                Present
              </span>
              <strong className="text-gray-900">{presentCount}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-700">
                <span className="h-3 w-3 rounded-full bg-red-600" aria-hidden="true" />
                Absent
              </span>
              <strong className="text-gray-900">{absentCount}</strong>
            </div>
            <p className="pt-1 text-xs text-gray-500">Based on past meetings in the portal.</p>
          </div>
        </div>
      </section>

      <div className="card mt-8 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Meeting</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3">
                    {new Date(r.date).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        r.status === "Present"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No past meetings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
