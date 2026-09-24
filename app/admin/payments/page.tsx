import { createClient } from "@/lib/supabase/server";
import PaymentManager, { type PaymentMember } from "./PaymentManager";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { q?: string; paid?: string };
}) {
  const searchTerm = searchParams.q?.trim().slice(0, 100) ?? "";
  const paid = searchParams.paid === "paid" || searchParams.paid === "unpaid" ? searchParams.paid : "";
  const paidFilter = paid === "paid" ? true : paid === "unpaid" ? false : null;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_payment_members", {
    search_term: searchTerm || null,
    paid_filter: paidFilter,
  });
  const members = (data as PaymentMember[] | null) ?? [];
  const paidCount = members.filter((member) => member.payment_verified).length;
  const unpaidCount = members.length - paidCount;
  const exportQuery = new URLSearchParams();
  if (searchTerm) exportQuery.set("q", searchTerm);
  const exportUrl = (status: string) => {
    const params = new URLSearchParams(exportQuery);
    if (status) params.set("paid", status);
    const query = params.toString();
    return `/api/export/payments${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-bold text-maroon-800">Payment Management</h1>
        <p className="mt-1 text-gray-600">Review member payments and mark members as paid or unpaid.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Members shown", members.length],
          ["Paid", paidCount],
          ["Unpaid", unpaidCount],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-3xl font-bold text-maroon-700">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4">
        <input name="q" defaultValue={searchTerm} placeholder="Search name or program" className="input-field min-w-[16rem] flex-1" />
        <select name="paid" defaultValue={paid} className="input-field max-w-[10rem]">
          <option value="">All payment statuses</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <button className="btn-secondary !px-4 !py-2 text-sm">Filter</button>
        <a href="/admin/payments" className="self-center text-sm font-semibold text-gray-500 hover:text-maroon-700">Clear</a>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-gray-600">Export:</span>
        <a href={exportUrl("")} className="btn-secondary !px-3 !py-2 text-sm">All</a>
        <a href={exportUrl("paid")} className="btn-secondary !px-3 !py-2 text-sm">Paid</a>
        <a href={exportUrl("unpaid")} className="btn-secondary !px-3 !py-2 text-sm">Unpaid</a>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">Payment records could not be loaded: {error.message}</p>}

      {members.length > 0 ? (
        <PaymentManager members={members} />
      ) : (
        <div className="card mt-6 px-4 py-10 text-center text-gray-500">No members found.</div>
      )}
    </div>
  );
}
