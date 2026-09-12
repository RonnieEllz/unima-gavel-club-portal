"use client";

import { useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { addAdministratorById } from "@/lib/actions/admin";
import type { AdminRoleName } from "@/types/database";

export default function AdministratorsForm({
  members,
}: {
  members: { id: string; full_name: string; program: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingGrant, setPendingGrant] = useState<{ userId: string; role: AdminRoleName } | null>(null);
  const grantFormRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <>
    <form
      ref={grantFormRef}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        const formData = new FormData(e.currentTarget);
        const userId = String(formData.get("user_id"));
        const role = formData.get("role") as AdminRoleName;
        setPendingGrant({ userId, role });
      }}
      className="card mt-6 grid gap-4 p-6 sm:grid-cols-3"
    >
      <div>
        <label className="label-field">Member</label>
        <select name="user_id" required className="input-field">
          <option value="">Select a member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name} ({m.program})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-field">Role</label>
        <select name="role" required className="input-field">
          <option value="administrator">Administrator</option>
          <option value="operations_admin">Operations Administrator</option>
          <option value="content_administrator">Content Administrator</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>
      <div className="flex items-end">
        <button disabled={isPending} className="btn-primary w-full sm:col-span-3">
          Grant Access
        </button>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
      {message && <p className="text-sm text-green-700 sm:col-span-3">{message}</p>}
      <p className="text-xs text-gray-400 sm:col-span-3">
        Only members with Active status appear here. A member must register and be approved
        before they can be made an administrator.
      </p>
    </form>
    {pendingGrant && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const password = String(new FormData(e.currentTarget).get("password") ?? "");
            startTransition(async () => {
              const result = await addAdministratorById(pendingGrant.userId, pendingGrant.role, password);
              if (result?.error) setError(result.error);
              else {
                setPendingGrant(null);
                setMessage("Administrator access granted successfully.");
                grantFormRef.current?.reset();
                router.refresh();
              }
            });
          }}
          className="card w-full max-w-md p-6"
        >
          <h2 className="font-display text-xl font-bold text-maroon-800">Confirm administrator access</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your password to grant this role.</p>
          <label htmlFor="grant-confirmation-password" className="label-field mt-4">Your Password</label>
          <input id="grant-confirmation-password" name="password" type="password" minLength={8} required autoFocus autoComplete="current-password" className="input-field" />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setPendingGrant(null)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
            <button disabled={isPending} className="btn-primary !px-4 !py-2 text-sm">{isPending ? "Confirming…" : "Confirm grant"}</button>
          </div>
        </form>
      </div>
    )}
    </>
  );
}
