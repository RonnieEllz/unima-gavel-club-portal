"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMemberPaymentStatus } from "@/lib/actions/admin";

export default function PaymentStatusControl({
  memberId,
  paid,
}: {
  memberId: string;
  paid: boolean;
}) {
  const [isPaid, setIsPaid] = useState(paid);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function applyChange() {
    if (pendingValue === null) return;

    startTransition(async () => {
      const result = await setMemberPaymentStatus(memberId, pendingValue);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsPaid(pendingValue);
      setPendingValue(null);
      setError(null);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          setPendingValue(!isPaid);
        }}
        className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${isPaid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
      >
        {isPending ? "Saving..." : isPaid ? "Paid" : "Unpaid"}
      </button>

      {pendingValue !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title">
            <h2 id="payment-confirm-title" className="font-display text-xl font-bold text-maroon-800">Confirm payment update</h2>
            <p className="mt-2 text-sm text-gray-600">
              Mark this member as <span className="font-semibold">{pendingValue ? "paid" : "unpaid"}</span>?
              {pendingValue && " The payment date will be set to today."}
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setPendingValue(null); setError(null); }} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button type="button" disabled={isPending} onClick={applyChange} className="btn-primary !px-4 !py-2 text-sm">
                {isPending ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}