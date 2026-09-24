import { createClient } from "@/lib/supabase/server";
import { calculateOperationalSummary } from "@/lib/operational-status";
import { getActiveSemester } from "@/lib/data";
import { getCurrentUserProfile } from "@/lib/data";
import { canManagePayments } from "@/lib/role-policy";
import type { Profile } from "@/types/database";
import BulkMemberStatusForm from "./BulkMemberStatusForm";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: { q?: string; program?: string; year?: string; sex?: string; status?: string; page?: string };
}) {
  const pageSize = 25;
  const supabase = createClient();
  const activeSemester = await getActiveSemester();
  const { adminRole } = await getCurrentUserProfile();
  const canEditPayments = canManagePayments(adminRole);
  let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false });
  const searchTerm = searchParams.q?.trim().replace(/[(),.]/g, " ").slice(0, 100);
  const programFilter = searchParams.program?.trim().slice(0, 80);
  const year = Number(searchParams.year);
  const sex = searchParams.sex === "male" || searchParams.sex === "female" ? searchParams.sex : "";
  const status = ["pending", "active", "inactive", "rejected", "alumni"].includes(searchParams.status ?? "") ? searchParams.status! : "";
  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), 1000) : 1;

  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    query = query.or(
      [
        `full_name.ilike.${pattern}`,
        `program.ilike.${pattern}`,
        `phone_number.ilike.${pattern}`,
        `holiday_residence.ilike.${pattern}`,
        `learning_expectations.ilike.${pattern}`,
        `preferred_placement.ilike.${pattern}`,
      ].join(",")
    );
  }
  if (programFilter) query = query.ilike("program", `%${programFilter}%`);
  if (Number.isInteger(year) && year >= 1 && year <= 5) query = query.eq("year_of_study", year);
  if (sex) query = query.eq("sex", sex);
  if (status) query = query.eq("membership_status", status);

  const { data: members, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  const memberList = (members as Profile[] | null) ?? [];
  const memberIds = memberList.map((member) => member.id);
  const [{ data: meetings }, { data: attendance }] = memberIds.length && activeSemester
    ? await Promise.all([
        supabase.from("meetings").select("id, date").eq("semester_id", activeSemester.id),
        supabase.from("attendance").select("member_id, meeting_id").in("member_id", memberIds),
      ])
    : [{ data: [] as { id: string; date: string }[] }, { data: [] as { member_id: string; meeting_id: string }[] }];
  const operationalMembers = memberList.map((member) => ({
    ...member,
    completedMeetingCount: (meetings ?? []).filter((meeting) => {
      const activationDate = member.membership_activated_at?.slice(0, 10);
      return meeting.date < new Date().toISOString().slice(0, 10) && (!activationDate || meeting.date >= activationDate);
    }).length,
    operationalSummary: calculateOperationalSummary({
      membershipStatus: member.membership_status,
      membershipActivatedAt: member.membership_activated_at,
      meetings: meetings ?? [],
      attendedMeetingIds: (attendance ?? [])
        .filter((record) => record.member_id === member.id)
        .map((record) => record.meeting_id),
    }),
  }));
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const filterParams = new URLSearchParams();
  if (searchTerm) filterParams.set("q", searchTerm);
  if (programFilter) filterParams.set("program", programFilter);
  if (searchParams.year) filterParams.set("year", searchParams.year);
  if (sex) filterParams.set("sex", sex);
  if (status) filterParams.set("status", status);
  const pageUrl = (targetPage: number) => {
    const params = new URLSearchParams(filterParams);
    params.set("page", String(targetPage));
    return `/admin/members?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-maroon-800">Members</h1>
        <a href={`/api/export/members?${filterParams.toString()}`} className="btn-secondary !px-4 !py-2 text-sm">
          Export CSV
        </a>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search members…"
          className="input-field min-w-[16rem] flex-1"
        />
        <input
          name="program"
          defaultValue={searchParams.program}
          placeholder="Program"
          className="input-field max-w-[12rem]"
        />
        <select name="year" defaultValue={searchParams.year} className="input-field max-w-[10rem]">
          <option value="">All Years</option>
          {[1, 2, 3, 4, 5].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
        <select name="sex" defaultValue={searchParams.sex} className="input-field max-w-[10rem]">
          <option value="">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select name="status" defaultValue={searchParams.status} className="input-field max-w-[10rem]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="rejected">Rejected</option>
          <option value="alumni">Alumni</option>
        </select>
        <button className="btn-secondary !px-4 !py-2 text-sm">Filter</button>
        <a href="/admin/members" className="self-center text-sm font-semibold text-gray-500 hover:text-maroon-700">
          Clear
        </a>
      </form>

      {memberList.length > 0 ? (
        <BulkMemberStatusForm members={operationalMembers} canManagePayments={canEditPayments} />
      ) : (
        <div className="card mt-6 px-4 py-10 text-center text-gray-500">No members found.</div>
      )}
      {memberList.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Page {page} of {totalPages} · {count ?? 0} members</span>
          <div className="flex gap-2">
            {page > 1 ? <a href={pageUrl(page - 1)} className="btn-secondary !px-4 !py-2">Previous</a> : <span className="rounded-md border border-gray-200 px-4 py-2 text-gray-400">Previous</span>}
            {page < totalPages ? <a href={pageUrl(page + 1)} className="btn-secondary !px-4 !py-2">Next</a> : <span className="rounded-md border border-gray-200 px-4 py-2 text-gray-400">Next</span>}
          </div>
        </div>
      )}
    </div>
  );
}
