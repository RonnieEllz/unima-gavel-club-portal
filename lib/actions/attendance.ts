"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";
import { recordAuditEvent } from "@/lib/actions/audit";
import { z } from "zod";

export type CheckInResult = { success?: boolean; error?: string };

export async function checkInToMeeting(meetingId: string): Promise<CheckInResult> {
  const parsedMeetingId = uuidSchema.safeParse(meetingId);
  if (!parsedMeetingId.success) return { error: "Invalid meeting." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to check in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("membership_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: "Unable to confirm your member status." };
  }

  if (profile?.membership_status !== "active") {
    return { error: "Only active members can check in to meetings." };
  }

  // RLS also enforces: attendance_open must be true, and member_id must
  // equal auth.uid(). The unique(member_id, meeting_id) constraint prevents
  // double check-in even under a race condition.
  const { error } = await supabase.from("attendance").insert({
    member_id: user.id,
    meeting_id: parsedMeetingId.data,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already checked in to this meeting." };
    }
    return { error: "Check-in is not currently open for this meeting." };
  }

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/meetings");
  revalidatePath("/dashboard");
  return { success: true };
}

const correctionReasonSchema = z.string().trim().min(3, "Provide a correction reason.").max(500);

export async function addAttendanceCorrection(meetingId: string, memberId: string, reason: string): Promise<CheckInResult> {
  const parsedMeetingId = uuidSchema.safeParse(meetingId);
  const parsedMemberId = uuidSchema.safeParse(memberId);
  const parsedReason = correctionReasonSchema.safeParse(reason);
  if (!parsedMeetingId.success || !parsedMemberId.success || !parsedReason.success) {
    return { error: parsedReason.success ? "Invalid attendance details." : parsedReason.error.issues[0]?.message };
  }

  const supabase = createClient();
  const [{ data: meeting }, { data: member }] = await Promise.all([
    supabase.from("meetings").select("id, title").eq("id", parsedMeetingId.data).maybeSingle(),
    supabase.from("profiles").select("id, full_name").eq("id", parsedMemberId.data).maybeSingle(),
  ]);
  if (!meeting || !member) return { error: "Meeting or member not found." };

  const { data: attendance, error } = await supabase
    .from("attendance")
    .insert({ member_id: parsedMemberId.data, meeting_id: parsedMeetingId.data })
    .select("id, checked_in_at")
    .single();
  if (error) {
    if (error.code === "23505") return { error: "This member is already checked in." };
    return { error: "Unable to add attendance correction." };
  }

  await recordAuditEvent({
    action: "attendance_added_by_admin",
    entityType: "attendance",
    entityId: attendance.id,
    afterData: { member_id: member.id, meeting_id: meeting.id, checked_in_at: attendance.checked_in_at },
    reason: parsedReason.data,
  });
  revalidatePath(`/admin/attendance?meeting=${meeting.id}`);
  revalidatePath("/dashboard/attendance");
  return { success: true };
}

export async function removeAttendanceCorrection(attendanceId: string, reason: string): Promise<CheckInResult> {
  const parsedAttendanceId = uuidSchema.safeParse(attendanceId);
  const parsedReason = correctionReasonSchema.safeParse(reason);
  if (!parsedAttendanceId.success || !parsedReason.success) {
    return { error: parsedReason.success ? "Invalid attendance record." : parsedReason.error.issues[0]?.message };
  }

  const supabase = createClient();
  const { data: attendance } = await supabase
    .from("attendance")
    .select("id, member_id, meeting_id, checked_in_at")
    .eq("id", parsedAttendanceId.data)
    .maybeSingle();
  if (!attendance) return { error: "Attendance record not found." };

  const { error } = await supabase.from("attendance").delete().eq("id", parsedAttendanceId.data);
  if (error) return { error: "Unable to remove attendance correction." };

  await recordAuditEvent({
    action: "attendance_removed_by_admin",
    entityType: "attendance",
    entityId: attendance.id,
    beforeData: attendance,
    reason: parsedReason.data,
  });
  revalidatePath(`/admin/attendance?meeting=${attendance.meeting_id}`);
  revalidatePath("/dashboard/attendance");
  return { success: true };
}
