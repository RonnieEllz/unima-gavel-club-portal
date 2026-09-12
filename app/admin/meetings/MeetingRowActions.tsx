"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAttendanceOpen, deleteMeeting } from "@/lib/actions/admin";
import MeetingEditForm from "./MeetingEditForm";
import type { Meeting } from "@/types/database";

export default function MeetingRowActions({
  meeting,
}: {
  meeting: Meeting;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          {
            setError(null);
            setMessage(null);
            startTransition(async () => {
              const result = await toggleAttendanceOpen(meeting.id, !meeting.attendance_open);
              if (result.error) setError(result.error);
              else {
                setMessage(meeting.attendance_open ? "Check-in closed." : "Check-in opened.");
                router.refresh();
              }
            });
          }
        }
        className="text-xs font-semibold text-maroon-700 hover:underline"
      >
        {meeting.attendance_open ? "Close Check-in" : "Open Check-in"}
      </button>
      <button
        disabled={isPending}
        onClick={() => { setError(null); setMessage(null); setDeleteOpen(true); }}
        className="text-xs font-semibold text-red-600 hover:underline"
      >
        Delete
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {message && <p className="text-xs text-green-700">{message}</p>}
      <MeetingEditForm meeting={meeting} />
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4" role="presentation">
          <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby={`delete-meeting-${meeting.id}`}>
            <h2 id={`delete-meeting-${meeting.id}`} className="font-display text-xl font-bold text-red-700">Delete meeting?</h2>
            <p className="mt-2 text-sm text-gray-600">
              This permanently deletes <span className="font-semibold">{meeting.title}</span> and all attendance records for it.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteOpen(false)} className="btn-secondary !px-4 !py-2 text-sm">Cancel</button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setDeleteOpen(false);
                  startTransition(async () => {
                    const result = await deleteMeeting(meeting.id);
                    if (result.error) setError(result.error);
                    else {
                      setMessage("Meeting deleted.");
                      router.refresh();
                    }
                  });
                }}
                className="btn-primary !bg-red-700 !px-4 !py-2 text-sm"
              >
                {isPending ? "Deleting..." : "Delete meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
