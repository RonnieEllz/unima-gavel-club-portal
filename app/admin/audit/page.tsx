import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 25;
const MAX_PAGE = 1000;

type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
};

function buildPageUrl(params: { action: string; entity: string; from: string; to: string }, page: number) {
  const search = new URLSearchParams();
  if (params.action) search.set("action", params.action);
  if (params.entity) search.set("entity", params.entity);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  search.set("page", String(page));
  return `/admin/audit?${search.toString()}`;
}

function formatJson(value: Record<string, unknown> | null) {
  if (!value) return "-";
  return JSON.stringify(value);
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: { action?: string; entity?: string; from?: string; to?: string; page?: string };
}) {
  const action = (searchParams.action ?? "").trim().slice(0, 100);
  const entity = (searchParams.entity ?? "").trim().slice(0, 100);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.from ?? "") ? searchParams.from! : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.to ?? "") ? searchParams.to! : "";
  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), MAX_PAGE) : 1;

  const supabase = createClient();
  let query = supabase
    .from("audit_logs")
    .select("id, actor_id, action, entity_type, entity_id, before_data, after_data, reason, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (action) query = query.ilike("action", `%${action}%`);
  if (entity) query = query.ilike("entity_type", `%${entity}%`);
  if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) query = query.lt("created_at", `${to}T00:00:00.000Z`);

  const { data, count, error } = await query;
  const logs = (data as AuditLog[] | null) ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const previousUrl = page > 1 ? buildPageUrl({ action, entity, from, to }, page - 1) : null;
  const nextUrl = page < totalPages ? buildPageUrl({ action, entity, from, to }, page + 1) : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-800">Audit History</h1>
          <p className="mt-1 text-gray-600">Review administrative changes and security-sensitive actions.</p>
        </div>
        <p className="text-sm text-gray-500">{count ?? 0} events</p>
      </div>

      <form method="get" className="mt-6 grid gap-3 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input name="action" defaultValue={action} placeholder="Action" className="input-field" />
        <input name="entity" defaultValue={entity} placeholder="Entity type" className="input-field" />
        <label className="text-sm text-gray-600">
          From
          <input name="from" type="date" defaultValue={from} className="input-field mt-1" />
        </label>
        <label className="text-sm text-gray-600">
          To
          <input name="to" type="date" defaultValue={to} className="input-field mt-1" />
        </label>
        <div className="flex items-end gap-2">
          <button className="btn-secondary w-full !px-4 !py-2 text-sm">Filter</button>
          <Link href="/admin/audit" className="btn-secondary whitespace-nowrap !px-4 !py-2 text-sm">Clear</Link>
        </div>
      </form>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Audit history could not be loaded. Please try again.
        </p>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Entity</th>
              <th className="px-4 py-3 font-semibold">Actor</th>
              <th className="px-4 py-3 font-semibold">Before</th>
              <th className="px-4 py-3 font-semibold">After</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{log.action}</td>
                <td className="px-4 py-3 text-gray-600">{log.entity_type}{log.entity_id ? ` (${log.entity_id.slice(0, 8)})` : ""}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.actor_id ?? "System"}</td>
                <td className="max-w-sm px-4 py-3 font-mono text-xs text-gray-500 break-words">{formatJson(log.before_data)}</td>
                <td className="max-w-sm px-4 py-3 font-mono text-xs text-gray-500 break-words">{formatJson(log.after_data)}</td>
                <td className="max-w-xs px-4 py-3 text-gray-600">{log.reason ?? "-"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No audit events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          {previousUrl ? <Link href={previousUrl} className="btn-secondary !px-4 !py-2">Previous</Link> : <span className="rounded-md border border-gray-200 px-4 py-2 text-gray-400">Previous</span>}
          {nextUrl ? <Link href={nextUrl} className="btn-secondary !px-4 !py-2">Next</Link> : <span className="rounded-md border border-gray-200 px-4 py-2 text-gray-400">Next</span>}
        </div>
      </div>
    </div>
  );
}
