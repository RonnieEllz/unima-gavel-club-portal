"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkSetMemberPaymentStatus } from "@/lib/actions/admin";

export type PaymentMember = {
  id: string;
  full_name: string;
  program: string;
  year_of_study: number;
  membership_status: string;
  payment_verified: boolean;
  last_payment_date: string | null;
};

export default function PaymentManager({ members }: { members: PaymentMember[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetPaid, setTargetPaid] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleMember = (memberId: string) => {
    setSelectedIds((current) => current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId]);
  };

  const toggleAll = () => {
    setSelectedIds((current) => current.length === members.length ? [] : members.map((member) => member.id));
  };

  function confirmBulkUpdate() {
    if (selectedIds.length === 0 || password.length < 8) return;
    startTransition(async () => {
      const result = await bulkSetMemberPaymentStatus(selectedIds, targetPaid, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      setPassword("");
      setSelectedIds([]);
      setError(null);
      setMessage(`${result.updated ?? selectedIds.length} member${(result.updated ?? selectedIds.length) === 1 ? "" : "s"} marked ${targetPaid ? "paid" : "unpaid"}.`);
      router.refresh();
    });
  }

  return (
    <>
      <div className="card mt-6 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={members.length > 0 && selectedIds.length === members.length} onChange={toggleAll} className="h-4 w-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700" />
            Select all
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
            <select value={targetPaid ? "paid" : "unpaid"} onChange={(event) => setTargetPaid(event.target.value === "paid")} className="input-field max-w-[9rem]">
              <option value="paid">Mark paid</option>
              <option value="unpaid">Mark unpaid</option>
            </select>
            <button type="button" disabled={selectedIds.length === 0 || isPending} onClick={() => { setError(null); setPassword(""); setConfirmOpen(true); }} className="btn-primary !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              Apply to selected
            </button>
          </div>
        </div>
        {message && <p className="px-4 pb-3 text-sm text-green-700">{message}</p>}
        {error && !confirmOpen && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-800">
            <tr>
              <th className="w-12 px-4 py-3" />
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Program</th>
              <th className="px-4 py-3 font-semibold">Year</th>
              <th className="px-4 py-3 font-semibold">Membership</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Last payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => {
              const selected = selectedIds.includes(member.id);
              return (
                <tr key={member.id} className={selected ? "bg-maroon-50/60" : undefined}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected} onChange={() => toggleMember(member.id)} aria-label={`Select ${member.full_name}`} className="h-4 w-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{member.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.program}</td>
                  <td className="px-4 py-3 text-gray-600">Year {member.year_of_study}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{member.membership_status}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.payment_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{member.payment_verified ? "Paid" : "Unpaid"}</span></td>
                  <td className="px-4 py-3 text-gray-600">{member.last_payment_date ? new Date(member.last_payment_date).toLocaleDateString() : "Not recorded"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="bulk-payment-title">
            <h2 id="bulk-payment-title" className="font-display text-xl font-bold text-maroon-800">Confirm payment update</h2>
            <p className="mt-2 text-sm text-gray-600">Mark {selectedIds.length} selected member{selectedIds.length === 1 ? "" : "s"} as <span className="font-semibold">{targetPaid ? "paid" : "unpaid"}</span>?</p>
            <label htmlFor="bulk-payment-password" className="label-field mt-4">Your password</label>
            <input id="bulk-payment-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoFocus autoComplete="current-password" className="input-field" />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setConfirmOpen(false); setPassword(""); setError(null); }} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button type="button" disabled={isPending || password.length < 8} onClick={confirmBulkUpdate} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">{isPending ? "Updating..." : "Confirm update"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
