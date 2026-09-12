"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeAdministrator } from "@/lib/actions/admin";

export default function RemoveAdminButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <button
        disabled={isPending}
        onClick={() => { setError(null); setMessage(null); setIsOpen(true); }}
        className="text-xs font-semibold text-red-600 hover:underline"
      >
        Remove
      </button>
      {error && <p className="mt-1 max-w-xs text-xs text-red-600">{error}</p>}
      {message && <p className="mt-1 max-w-xs text-xs text-green-700">{message}</p>}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              const password = String(new FormData(event.currentTarget).get("password") ?? "");
              startTransition(async () => {
                const result = await removeAdministrator(userId, password);
                if (result?.error) setError(result.error);
                else {
                  setIsOpen(false);
                  setMessage("Administrator access removed successfully.");
                  router.refresh();
                }
              });
            }}
            className="card w-full max-w-md p-6"
          >
            <h2 className="font-display text-xl font-bold text-maroon-800">Remove administrator access</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your password to confirm this removal.</p>
            <label htmlFor={`remove-password-${userId}`} className="label-field mt-4">Your Password</label>
            <input id={`remove-password-${userId}`} name="password" type="password" minLength={8} required autoFocus autoComplete="current-password" className="input-field" />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button disabled={isPending} className="btn-primary !bg-red-700 !px-4 !py-2 text-sm">{isPending ? "Confirming…" : "Confirm removal"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
