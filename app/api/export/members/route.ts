import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canManageOperations } from "@/lib/role-policy";
import type { AdminRoleName } from "@/types/database";

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
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

export async function GET(request: Request) {
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
    return NextResponse.json({ error: "You are not authorized to export members." }, { status: 403 });
  }

  // RLS still applies here. A non-admin session hitting this route directly
  // will simply get back only rows it's allowed to see (its own profile, if any).
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim().replace(/[(),.]/g, " ").slice(0, 100) ?? "";
  const program = params.get("program")?.trim().slice(0, 80) ?? "";
  const year = Number(params.get("year"));
  const sex = params.get("sex") === "male" || params.get("sex") === "female" ? params.get("sex") : "";
  const statuses = ["pending", "active", "inactive", "rejected", "alumni"];
  const status = statuses.includes(params.get("status") ?? "") ? params.get("status") : "";
  let query = supabase
    .from("profiles")
    .select(
      "full_name, program, year_of_study, sex, phone_number, holiday_residence, membership_status, created_at"
    )
    .order("created_at", { ascending: false });
  if (q) query = query.or(`full_name.ilike.%${q}%,program.ilike.%${q}%,phone_number.ilike.%${q}%,holiday_residence.ilike.%${q}%,learning_expectations.ilike.%${q}%,preferred_placement.ilike.%${q}%`);
  if (program) query = query.ilike("program", `%${program}%`);
  if (Number.isInteger(year) && year >= 1 && year <= 5) query = query.eq("year_of_study", year);
  if (sex) query = query.eq("sex", sex);
  if (status) query = query.eq("membership_status", status);
  const { data, error } = await query;

  if (error) {
    console.error("Member export failed", error);
    return NextResponse.json({ error: "Unable to export members." }, { status: 500 });
  }

  const csv = toCsv(data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="gavel-club-members.csv"`,
    },
  });
}
