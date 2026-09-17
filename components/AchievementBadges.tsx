type Badge = {
  name: string;
  requirement: string;
  threshold: number;
  variant: string;
  expression: string;
  earned: boolean;
};

function BadgeFigure({ variant, earned, expression }: Pick<Badge, "variant" | "earned" | "expression">) {
  return (
    <span className={`achievement-figure achievement-figure-${variant} ${earned ? "achievement-figure-earned" : "achievement-figure-locked"}`} aria-hidden="true">
      <span className="achievement-face">{expression}</span>
      <span className="achievement-arm achievement-arm-left" />
      <span className="achievement-arm achievement-arm-right" />
    </span>
  );
}

export default function AchievementBadges({ attendedCount, completedMeetingCount }: { attendedCount: number; completedMeetingCount: number }) {
  const perfectAttendance = completedMeetingCount > 0 && attendedCount === completedMeetingCount;
  const badges: Badge[] = [
    { name: "First Step", requirement: "Attend 1 meeting", threshold: 1, variant: "first", expression: ".", earned: attendedCount >= 1 },
    { name: "Consistent Presence", requirement: "Attend 3 meetings", threshold: 3, variant: "steady", expression: "^", earned: attendedCount >= 3 },
    { name: "Halfway Hero", requirement: "Attend 5 meetings", threshold: 5, variant: "hero", expression: ":)", earned: attendedCount >= 5 },
    { name: "Committed Member", requirement: "Attend 7 meetings", threshold: 7, variant: "commit", expression: "*", earned: attendedCount >= 7 },
    { name: "Semester Champion", requirement: "Attend 10 meetings", threshold: 10, variant: "champion", expression: "*", earned: attendedCount >= 10 },
    { name: "Perfect Attendance", requirement: "Attend every completed meeting", threshold: completedMeetingCount, variant: "perfect", expression: "!", earned: perfectAttendance },
  ];
  const currentBadge = perfectAttendance
    ? badges[badges.length - 1]
    : badges.find((badge) => !badge.earned) ?? badges[badges.length - 1];

  return (
    <section className="mt-3 border-t border-gray-100 pt-3 sm:mt-5 sm:pt-5" aria-labelledby="achievement-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="achievement-heading" className="font-display text-lg font-bold text-maroon-800 sm:text-xl">Member progress</h2>
        </div>
      </div>
      <div className="achievement-badge achievement-badge-earned mt-3 flex items-center gap-3 text-left sm:mt-4 sm:gap-4" title={`${currentBadge.name}: ${currentBadge.requirement}`}>
        <BadgeFigure variant={currentBadge.variant} earned={currentBadge.earned} expression={currentBadge.expression} />
        <div>
          <p className="text-base font-bold text-maroon-800">{currentBadge.name}</p>
          <p className="mt-1 text-sm text-gray-600">{currentBadge.requirement}</p>
          <p className="mt-2 text-xs font-semibold text-maroon-700">
            {perfectAttendance ? "Achievement earned" : "Next goal"}
          </p>
        </div>
      </div>
    </section>
  );
}
