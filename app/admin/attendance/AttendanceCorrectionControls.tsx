"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAttendanceCorrection, removeAttendanceCorrection } from "@/lib/actions/attendance";

export function AddAttendanceForm({
  meetingId,
  members,
}: {
  meetingId: string;
  members: { id: string; full_name: string; program: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const filteredMembers = members.filter((member) =>
    `${member.full_name} ${member.program}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <form
      className="mt-6 grid gap-3 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        startTransition(async () => {
          const result = await addAttendanceCorrection(meetingId, String(form.get("member_id") ?? ""), String(form.get("reason") ?? ""));
          if (result.error) setError(result.error);
          else {
            formElement.reset();
            setMessage("Check-in added successfully.");
            router.refresh();
          }
        });
      }}
    >
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search member by name or program"
        className="input-field"
        aria-label="Search members"
      />
      <select name="member_id" required className="input-field" defaultValue="">
        <option value="">Select member...</option>
        {filteredMembers.map((member) => <option key={member.id} value={member.id}>{member.full_name} ({member.program})</option>)}
      </select>
      <input name="reason" required minLength={3} maxLength={500} className="input-field" placeholder="Reason for manual check-in" />
      <button disabled={isPending || filteredMembers.length === 0} className="btn-primary whitespace-nowrap">{isPending ? "Adding..." : "Add Check-in"}</button>
      {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
      {message && <p className="text-sm text-green-700 sm:col-span-3">{message}</p>}
    </form>
  );
}

export function RemoveAttendanceButton({ attendanceId }: { attendanceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <div>
      <button
        disabled={isPending}
        className="text-xs font-semibold text-red-600 hover:underline"
        onClick={() => { setError(null); setMessage(null); setIsOpen(true); }}
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
              const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
              startTransition(async () => {
                const result = await removeAttendanceCorrection(attendanceId, reason);
                if (result.error) setError(result.error);
                else {
                  setIsOpen(false);
                  setMessage("Check-in removed successfully.");
                  router.refresh();
                }
              });
            }}
            className="card w-full max-w-md p-6"
          >
            <h2 className="font-display text-xl font-bold text-red-700">Remove check-in</h2>
            <p className="mt-2 text-sm text-gray-600">Provide a reason for this attendance correction.</p>
            <label htmlFor={`attendance-removal-reason-${attendanceId}`} className="label-field mt-4">Reason</label>
            <textarea id={`attendance-removal-reason-${attendanceId}`} name="reason" required minLength={3} maxLength={500} rows={3} autoFocus className="input-field" />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button disabled={isPending} className="btn-primary !bg-red-700 !px-4 !py-2 text-sm">{isPending ? "Removing..." : "Remove check-in"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
