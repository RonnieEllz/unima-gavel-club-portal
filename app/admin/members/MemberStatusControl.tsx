"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { setMembershipStatus } from "@/lib/actions/admin";
import type { MembershipStatus } from "@/types/database";

const options: MembershipStatus[] = ["pending", "active", "inactive", "rejected"];

const styles: Record<MembershipStatus, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

export default function MemberStatusControl({
  memberId,
  currentStatus,
}: {
  memberId: string;
  currentStatus: MembershipStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<MembershipStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const confirmStatusChange = (next: MembershipStatus) => {
    setPendingStatus(next);
    setError(null);
  };

  const applyStatusChange = () => {
    if (!pendingStatus) return;

    startTransition(async () => {
      const result = await setMembershipStatus(memberId, pendingStatus);
      if (result?.error) {
        setStatus(currentStatus);
        setError(result.error);
      } else {
        setStatus(pendingStatus);
        setPendingStatus(null);
        router.refresh();
      }
    });
  };

  return (
    <>
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as MembershipStatus;
          confirmStatusChange(next);
        }}
        className={`rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      {pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="status-confirm-title">
            <h2 id="status-confirm-title" className="font-display text-xl font-bold text-maroon-800">Confirm status update</h2>
            <p className="mt-2 text-sm text-gray-600">
              Change member status from <span className="font-semibold capitalize">{status}</span> to <span className="font-semibold capitalize">{pendingStatus}</span>?
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setPendingStatus(null); setError(null); }} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button type="button" disabled={isPending} onClick={applyStatusChange} className="btn-primary !px-4 !py-2 text-sm">{isPending ? "Updating..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
