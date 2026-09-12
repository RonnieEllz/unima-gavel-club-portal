import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canManageOperations } from "@/lib/role-policy";
import type { AdminRoleName } from "@/types/database";

function toCsv(rows: Record<string, unknown>[]) {
  const headers = ["meeting_title", "meeting_date", "full_name", "program", "year_of_study", "checked_in_at"];
  const escape = (v: unknown) => {
    const value = String(v ?? "");
    const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  const meetingId = request.nextUrl.searchParams.get("meeting");
  const meetingIds = (request.nextUrl.searchParams.get("meetings") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const from = request.nextUrl.searchParams.get("from") ?? "";
  const to = request.nextUrl.searchParams.get("to") ?? "";
  const program = request.nextUrl.searchParams.get("program")?.trim().slice(0, 80) ?? "";
  const year = Number(request.nextUrl.searchParams.get("year"));
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  if ((meetingId && !uuidPattern.test(meetingId)) || meetingIds.some((id) => !uuidPattern.test(id))) {
    return NextResponse.json({ error: "Invalid meeting selection." }, { status: 400 });
  }
  if ((from && !validDate(from)) || (to && !validDate(to)) || (from && to && from > to)) {
    return NextResponse.json({ error: "Invalid attendance date range." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  const { data: adminRoleData } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const adminRole = adminRoleData as { role: AdminRoleName } | null;

  if (!adminRole || !canManageOperations(adminRole.role)) {
    return NextResponse.json({ error: "You are not authorized to export attendance." }, { status: 403 });
  }

  let meetingsQuery = supabase.from("meetings").select("id, title, date");
  if (meetingId) meetingsQuery = meetingsQuery.eq("id", meetingId);
  if (meetingIds.length > 0) meetingsQuery = meetingsQuery.in("id", meetingIds.slice(0, 100));
  if (from) meetingsQuery = meetingsQuery.gte("date", from);
  if (to) {
    const end = new Date(`${to}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    meetingsQuery = meetingsQuery.lt("date", end.toISOString().slice(0, 10));
  }
  const { data: meetings, error: meetingsError } = await meetingsQuery;
  if (meetingsError) {
    console.error("Attendance meeting export failed", meetingsError);
    return NextResponse.json({ error: "Unable to export attendance." }, { status: 500 });
  }

  const meetingRows = (meetings ?? []) as { id: string; title: string; date: string }[];
  let memberQuery = supabase.from("profiles").select("id").eq("membership_status", "active");
  if (program) memberQuery = memberQuery.ilike("program", `%${program}%`);
  if (Number.isInteger(year) && year >= 1 && year <= 5) memberQuery = memberQuery.eq("year_of_study", year);
  const { data: memberRows, error: memberError } = await memberQuery;
  if (memberError) return NextResponse.json({ error: "Unable to export attendance." }, { status: 500 });
  const memberIds = (memberRows ?? []).map((member) => member.id);
  const { data, error } = meetingRows.length && memberIds.length
    ? await supabase
        .from("attendance")
        .select("meeting_id, checked_in_at, profiles(full_name, program, year_of_study)")
        .in("meeting_id", meetingRows.map((meeting) => meeting.id))
        .in("member_id", memberIds)
        .order("checked_in_at", { ascending: true })
    : { data: [], error: null };

  if (error) {
    console.error("Attendance export failed", error);
    return NextResponse.json({ error: "Unable to export attendance." }, { status: 500 });
  }

  const meetingById = new Map(meetingRows.map((meeting) => [meeting.id, meeting]));
  const rows = (data ?? []).map((r: any) => ({
    meeting_title: meetingById.get(r.meeting_id)?.title,
    meeting_date: meetingById.get(r.meeting_id)?.date,
    full_name: r.profiles?.full_name,
    program: r.profiles?.program,
    year_of_study: r.profiles?.year_of_study,
    checked_in_at: r.checked_in_at,
  }));

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="attendance-${meetingId ?? (meetingIds.length ? "selected" : `${from || "all"}-to-${to || "all"}`)}.csv"`,
    },
  });
}
