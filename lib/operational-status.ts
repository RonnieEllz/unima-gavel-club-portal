export type OperationalStatus = "active" | "review" | "inactive";

export type OperationalSummary = {
  status: OperationalStatus;
  attendedCount: number;
  missedCount: number;
  consecutiveMisses: number;
};

export function calculateOperationalSummary({
  membershipStatus,
  attendedMeetingIds,
  meetings,
  membershipActivatedAt,
}: {
  membershipStatus: "pending" | "active" | "inactive" | "rejected" | "alumni";
  attendedMeetingIds: string[];
  meetings: { id: string; date: string }[];
  membershipActivatedAt: string | null;
}): OperationalSummary {
  if (membershipStatus === "rejected" || membershipStatus === "alumni") {
    return { status: "inactive", attendedCount: 0, missedCount: 0, consecutiveMisses: 0 };
  }

  const activationDate = membershipActivatedAt?.slice(0, 10) ?? null;
  const eligibleMeetings = meetings
    .filter((meeting) => !activationDate || meeting.date >= activationDate)
    .sort((left, right) => left.date.localeCompare(right.date));
  const attended = new Set(attendedMeetingIds);
  let attendedCount = 0;
  let missedCount = 0;
  let consecutiveMisses = 0;
  let currentMisses = 0;

  for (const meeting of eligibleMeetings) {
    if (attended.has(meeting.id)) {
      attendedCount += 1;
      currentMisses = 0;
    } else {
      missedCount += 1;
      currentMisses += 1;
      consecutiveMisses = Math.max(consecutiveMisses, currentMisses);
    }
  }

  const status: OperationalStatus =
    attendedCount >= 3 ? "active" : consecutiveMisses >= 4 ? "review" : "inactive";
  return { status, attendedCount, missedCount, consecutiveMisses };
}
