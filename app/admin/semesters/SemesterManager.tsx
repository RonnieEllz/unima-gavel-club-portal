"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { activateSemester, completeSemester, createSemester } from "@/lib/actions/admin";
import type { Semester } from "@/types/database";

export default function SemesterManager({ semesters }: { semesters: Semester[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState<Semester | null>(null);
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      setMessage(null);
      setError(null);
      const result = await createSemester(new FormData(form));
      if (result.error) setError(result.error);
      else { setMessage("Semester created."); form.reset(); router.refresh(); }
    });
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1fr)]">
      <form onSubmit={submit} className="card grid gap-3 p-6">
        <h2 className="font-display text-xl font-bold text-maroon-800">Create semester</h2>
        <input name="name" placeholder="Semester name" className="input-field" required />
        <label className="text-sm text-gray-600">Starts on<input name="starts_on" type="date" className="input-field mt-1" required /></label>
        <label className="text-sm text-gray-600">Ends on<input name="ends_on" type="date" className="input-field mt-1" required /></label>
        <button disabled={isPending} className="btn-primary !px-4 !py-2 text-sm">{isPending ? "Saving..." : "Create semester"}</button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold text-maroon-800">Semesters</h2>
        <div className="mt-4 space-y-3">
          {semesters.map((semester) => (
            <div key={semester.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3">
              <div><p className="font-semibold text-gray-800">{semester.name}</p><p className="text-xs text-gray-500">{semester.starts_on} to {semester.ends_on}</p></div>
              <div className="flex items-center gap-2">
                {semester.completed_at ? (
                  <span className="text-xs font-semibold text-gray-500">Completed</span>
                ) : semester.is_active ? (
                  <span className="text-xs font-semibold text-green-700">Active</span>
                ) : (
                  <button type="button" disabled={isPending} onClick={() => startTransition(async () => { setMessage(null); setError(null); const result = await activateSemester(semester.id); if (result.error) setError(result.error); else { setMessage("Semester activated."); router.refresh(); } })} className="btn-secondary !px-3 !py-1 text-xs">Activate</button>
                )}
                {!semester.completed_at && new Date(`${semester.ends_on}T00:00:00Z`) < new Date() && (
                  <button type="button" disabled={isPending} onClick={() => { setError(null); setPendingClose(semester); }} className="btn-primary !px-3 !py-1 text-xs">Close semester</button>
                )}
              </div>
            </div>
          ))}
          {semesters.length === 0 && <p className="text-sm text-gray-500">No semesters configured.</p>}
        </div>
      </section>

      {pendingClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const password = String(new FormData(event.currentTarget).get("password") ?? "");
              startTransition(async () => {
                setMessage(null);
                setError(null);
                const result = await completeSemester(pendingClose.id, password);
                if (result.error) setError(result.error);
                else {
                  setPendingClose(null);
                  setMessage(`${result.progressed ?? 0} member${result.progressed === 1 ? "" : "s"} progressed.`);
                  router.refresh();
                }
              });
            }}
            className="card w-full max-w-md p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-semester-title"
          >
            <h2 id="close-semester-title" className="font-display text-xl font-bold text-maroon-800">Close semester</h2>
            <p className="mt-2 text-sm text-gray-600">
              This will complete <span className="font-semibold">{pendingClose.name}</span> and process eligible member progression. Enter your password to continue.
            </p>
            <label htmlFor="close-semester-password" className="label-field mt-4">Your Password</label>
            <input id="close-semester-password" name="password" type="password" minLength={8} required autoFocus autoComplete="current-password" className="input-field" />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setPendingClose(null); setError(null); }} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button disabled={isPending} className="btn-primary !px-4 !py-2 text-sm">{isPending ? "Closing..." : "Confirm close"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}