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
      <span className="block rounded-md bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 sm:inline-block">
        ✓ Attendance recorded successfully
      </span>
    );
  }

  if (!canCheckIn) {
    return (
      <span className="block rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-500 sm:inline-block">Active members can check in to meetings.</span>
    );
  }

  if (!attendanceOpen) {
    return (
      <span className="block rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-500 sm:inline-block">Check-in not open</span>
    );
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await checkInToMeeting(meetingId);
            setState(result);
          })
        }
        disabled={isPending}
        className="btn-primary w-full !px-4 !py-2 text-sm sm:w-auto"
      >
        {isPending ? "Checking in…" : "CHECK IN TO MEETING"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
