import type { Meeting } from "@/types/database";
import CheckInButton from "@/app/dashboard/meetings/CheckInButton";

export default function MeetingCard({
  meeting,
  alreadyCheckedIn = false,
  showCheckIn = false,
  canCheckIn = true,
}: {
  meeting: Meeting;
  alreadyCheckedIn?: boolean;
  showCheckIn?: boolean;
  canCheckIn?: boolean;
}) {
  const date = new Date(`${meeting.date}T${meeting.time}`);
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="flex items-center gap-3 sm:min-w-0">
        <div className="flex w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-maroon-700 py-2 text-white sm:w-16">
          <span className="text-xs uppercase">{date.toLocaleDateString(undefined, { month: "short" })}</span>
          <span className="text-xl font-bold leading-none">{date.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-maroon-800">{meeting.title}</h4>
          <p className="text-sm text-gray-600">
            {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} · {meeting.venue}
          </p>
          {meeting.description && <p className="mt-1 text-sm text-gray-500">{meeting.description}</p>}
        </div>
      </div>

      <div className="w-full sm:w-auto sm:flex-shrink-0">
        {showCheckIn ? (
          <CheckInButton
            meetingId={meeting.id}
            alreadyCheckedIn={alreadyCheckedIn}
            attendanceOpen={meeting.attendance_open}
            canCheckIn={canCheckIn}
          />
        ) : meeting.attendance_open ? (
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Check-in open
          </span>
        ) : null}
      </div>
    </div>
  );
}
