"use client";

import { useState, useTransition } from "react";
import { checkInToMeeting } from "@/lib/actions/attendance";

export default function CheckInButton({
  meetingId,
  alreadyCheckedIn,
  attendanceOpen,
  canCheckIn,
}: {
  meetingId: string;
  alreadyCheckedIn: boolean;
  attendanceOpen: boolean;
  canCheckIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ success?: boolean; error?: string }>({
    success: alreadyCheckedIn,
  });

  if (state.success) {
    return (
      <span className="rounded-md bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
        ✓ Attendance recorded successfully
      </span>
    );
  }

  if (!canCheckIn) {
    return (
      <span className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-500">Active members can check in to meetings.</span>
    );
  }

  if (!attendanceOpen) {
    return (
      <span className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-500">Check-in not open</span>
    );
  }

  return (
    <div>
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await checkInToMeeting(meetingId);
            setState(result);
          })
        }
        disabled={isPending}
        className="btn-primary !px-4 !py-2 text-sm"
      >
        {isPending ? "Checking in…" : "CHECK IN TO MEETING"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
