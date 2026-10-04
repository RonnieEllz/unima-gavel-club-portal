export type AchievementBadge = {
  name: string;
  requirement: string;
  threshold: number;
  variant: string;
  expression: string;
  earned: boolean;
};

export type MemberSex = "male" | "female";

export function getAchievementBadges(attendedCount: number, completedMeetingCount: number): AchievementBadge[] {
  const perfectAttendance = completedMeetingCount > 0 && attendedCount === completedMeetingCount;
  return [
    { name: "First Step", requirement: "Attend 1 meeting", threshold: 1, variant: "first", expression: ".", earned: attendedCount >= 1 },
    { name: "Consistent Presence", requirement: "Attend 3 meetings", threshold: 3, variant: "steady", expression: ":)", earned: attendedCount >= 3 },
    { name: "Halfway Hero", requirement: "Attend 5 meetings", threshold: 5, variant: "hero", expression: ":)", earned: attendedCount >= 5 },
    { name: "Committed Member", requirement: "Attend 7 meetings", threshold: 7, variant: "commit", expression: "*", earned: attendedCount >= 7 },
    { name: "Semester Champion", requirement: "Attend 10 meetings", threshold: 10, variant: "champion", expression: "*", earned: attendedCount >= 10 },
    { name: "Perfect Attendance", requirement: "Attend every completed meeting", threshold: completedMeetingCount, variant: "perfect", expression: "!", earned: perfectAttendance },
  ];
}
