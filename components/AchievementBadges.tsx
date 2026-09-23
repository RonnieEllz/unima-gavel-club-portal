"use client";

import { useState } from "react";

type Badge = {
  name: string;
  requirement: string;
  threshold: number;
  variant: string;
  expression: string;
  earned: boolean;
};

type MemberSex = "male" | "female";

function BadgeFigure({ variant, earned, expression, sex, attendedCount, badgeName }: Pick<Badge, "variant" | "earned" | "expression" | "name"> & { sex: MemberSex; attendedCount: number }) {
  const [isDancing, setIsDancing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  function makeDance() {
    setIsDancing(false);
    setShowCelebration(true);
    window.setTimeout(() => setIsDancing(true), 0);
    window.setTimeout(() => setIsDancing(false), 850);
    window.setTimeout(() => setShowCelebration(false), 2400);
  }

  return (
    <span className="achievement-figure-wrap">
      <button
        type="button"
        className={`achievement-figure achievement-figure-${variant} achievement-figure-${sex} ${earned ? "achievement-figure-earned" : "achievement-figure-locked"} ${isDancing ? "achievement-figure-dancing" : ""}`}
        onClick={makeDance}
        aria-label="Celebrate attendance achievement"
      >
        <span className="achievement-tooltip" role="tooltip">Come again next week</span>
        <span className="achievement-aura" aria-hidden="true" />
        <span className="achievement-face" aria-hidden="true">
          <span className="achievement-eyes" />
          <span className="achievement-mouth">{expression}</span>
        </span>
        <span className="achievement-arm achievement-arm-left" aria-hidden="true" />
        <span className="achievement-arm achievement-arm-right" aria-hidden="true" />
        {variant === "perfect" && (
          <>
            <span className="achievement-balloon achievement-balloon-left" aria-hidden="true" />
            <span className="achievement-balloon achievement-balloon-right" aria-hidden="true" />
            <span className="achievement-star achievement-star-left" aria-hidden="true">★</span>
            <span className="achievement-star achievement-star-right" aria-hidden="true">★</span>
          </>
        )}
      </button>
      {showCelebration && (
        <span className="achievement-celebration" role="status" aria-live="polite">
          <strong>Great work!</strong>
          <span>You have attended {attendedCount} {attendedCount === 1 ? "meeting" : "meetings"}.</span>
          <em>{badgeName}</em>
        </span>
      )}
    </span>
  );
}

export default function AchievementBadges({ attendedCount, completedMeetingCount, sex = "male" }: { attendedCount: number; completedMeetingCount: number; sex?: MemberSex }) {
  const perfectAttendance = completedMeetingCount > 0 && attendedCount === completedMeetingCount;
  const badges: Badge[] = [
    { name: "First Step", requirement: "Attend 1 meeting", threshold: 1, variant: "first", expression: ".", earned: attendedCount >= 1 },
    { name: "Consistent Presence", requirement: "Attend 3 meetings", threshold: 3, variant: "steady", expression: ":)", earned: attendedCount >= 3 },
    { name: "Halfway Hero", requirement: "Attend 5 meetings", threshold: 5, variant: "hero", expression: ":)", earned: attendedCount >= 5 },
    { name: "Committed Member", requirement: "Attend 7 meetings", threshold: 7, variant: "commit", expression: "*", earned: attendedCount >= 7 },
    { name: "Semester Champion", requirement: "Attend 10 meetings", threshold: 10, variant: "champion", expression: "*", earned: attendedCount >= 10 },
    { name: "Perfect Attendance", requirement: "Attend every completed meeting", threshold: completedMeetingCount, variant: "perfect", expression: "!", earned: perfectAttendance },
  ];
  const currentBadge = perfectAttendance
    ? badges[badges.length - 1]
    : badges.find((badge) => !badge.earned) ?? badges[badges.length - 1];
  const earnedBadge = [...badges].reverse().find((badge) => badge.earned);

  return (
    <section className="mt-3 flex flex-col items-end border-t border-gray-100 pt-3 sm:mt-5 sm:pt-5" aria-labelledby="achievement-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="achievement-heading" className="font-display text-lg font-bold text-maroon-800 sm:text-xl">Member progress</h2>
        </div>
      </div>
      <div className="achievement-badge achievement-badge-earned ml-auto mt-3 flex w-full max-w-full items-center justify-end gap-3 text-left sm:mt-4 sm:w-fit sm:gap-4" title={`${currentBadge.name}: ${currentBadge.requirement}`}>
        <BadgeFigure variant={currentBadge.variant} earned={currentBadge.earned} expression={currentBadge.expression} sex={sex} attendedCount={attendedCount} badgeName={earnedBadge?.name ?? "No badge earned yet"} />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-maroon-700">
            {perfectAttendance ? "Achievement earned" : "Next goal"}
          </p>
          <p className="mt-1 break-words text-sm text-gray-600">{currentBadge.requirement}</p>
          <p className="mt-2 break-words text-base font-bold text-maroon-800">{currentBadge.name}</p>
        </div>
      </div>
    </section>
  );
}
