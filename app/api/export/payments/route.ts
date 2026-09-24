import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canManagePayments } from "@/lib/role-policy";
import type { AdminRoleName } from "@/types/database";

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = String(value ?? "");
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  const { data: roleData } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  const role = roleData as { role: AdminRoleName } | null;
  if (!role || !canManagePayments(role.role)) {
    return NextResponse.json({ error: "You are not authorized to export payment records." }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const searchTerm = params.get("q")?.trim().slice(0, 100) ?? "";
  const paid = params.get("paid");
  const paidFilter = paid === "paid" ? true : paid === "unpaid" ? false : null;
  const { data, error } = await supabase.rpc("get_payment_members", {
    search_term: searchTerm || null,
    paid_filter: paidFilter,
  });

  if (error) {
    console.error("Payment export failed", error);
    return NextResponse.json({ error: "Unable to export payment records." }, { status: 500 });
  }

  const rows = ((data ?? []) as Record<string, unknown>[]).map((member) => ({
    Name: member.full_name,
    Program: member.program,
    Year: member.year_of_study,
    Membership: member.membership_status,
    Payment: member.payment_verified ? "Paid" : "Unpaid",
    "Last payment": member.last_payment_date ? new Date(String(member.last_payment_date)).toLocaleDateString() : "",
  }));
  const filename = paid === "paid" ? "gavel-club-paid-members.csv" : paid === "unpaid" ? "gavel-club-unpaid-members.csv" : "gavel-club-payment-records.csv";

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
