"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, PostType, AdminRoleName } from "@/types/database";
import { getAuthContext, isSuperAdmin } from "@/lib/authz";
import { canManageOperations, canManageSemesters } from "@/lib/role-policy";
import { recordAuditEvent } from "@/lib/actions/audit";
import {
  adminRoleSchema,
  aboutPageSettingsSchema,
  footerSettingsSchema,
  landingPageContentSchema,
  meetingSchema,
  memberDetailsSchema,
  postSchema,
  postTypeSchema,
  semesterSchema,
  uuidSchema,
} from "@/lib/validation";

// Every function here relies on Postgres RLS (is_admin() / is_super_admin() /
// has_content_access()) as the real authorization check. If the calling user
// lacks the right role, Supabase returns an error and nothing is written.
// these actions do not themselves decide who is allowed to do what.

// ---------------------------------------------------------------------------
// MEMBERS
// ---------------------------------------------------------------------------
export async function createSemester(formData: FormData) {
  const parsed = semesterSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    starts_on: String(formData.get("starts_on") ?? ""),
    ends_on: String(formData.get("ends_on") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid semester." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };
  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role || !canManageSemesters(role.role as AdminRoleName)) return { error: "Only an administrator can manage semesters." };

  const { data: semester, error } = await supabase.from("semesters").insert({ ...parsed.data, is_active: false }).select("id").single();
  if (error) return { error: error.message };
  await recordAuditEvent({ action: "semester_created", entityType: "semester", entityId: semester.id, afterData: parsed.data });
  revalidatePath("/admin/semesters");
  return { success: true };
}

export async function activateSemester(semesterId: string) {
  const parsedId = uuidSchema.safeParse(semesterId);
  if (!parsedId.success) return { error: "Invalid semester." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };
  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role || !canManageSemesters(role.role as AdminRoleName)) return { error: "Only an administrator can manage semesters." };

  const { data: previous } = await supabase.from("semesters").select("id, is_active").eq("is_active", true).maybeSingle();
  const { error: deactivateError } = await supabase.from("semesters").update({ is_active: false }).eq("is_active", true);
  if (deactivateError) return { error: deactivateError.message };
  const { error } = await supabase.from("semesters").update({ is_active: true }).eq("id", parsedId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({ action: "semester_activated", entityType: "semester", entityId: parsedId.data, beforeData: previous, afterData: { is_active: true } });
  revalidatePath("/admin/semesters");
  revalidatePath("/admin/members");
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeSemester(semesterId: string, password: string) {
  const parsedId = uuidSchema.safeParse(semesterId);
  const parsedPassword = z.string().min(8, "Enter your current password to close this semester.").safeParse(password);
  if (!parsedId.success) return { error: "Invalid semester." };
  if (!parsedPassword.success) return { error: parsedPassword.error.issues[0]?.message ?? "Invalid password." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };
  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role || !canManageSemesters(role.role as AdminRoleName)) return { error: "Only an administrator can complete semesters." };
  if (!(await confirmCurrentPassword(supabase, { userId: user.id }, parsedPassword.data))) {
    return { error: "Password confirmation failed. The semester was not closed." };
  }

  const { data: semester, error: semesterError } = await supabase
    .from("semesters")
    .select("id, name, starts_on, ends_on, is_active, completed_at")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (semesterError) return { error: semesterError.message };
  if (!semester) return { error: "Semester not found." };
  if (semester.completed_at) return { error: "This semester has already been completed." };
  if (semester.ends_on >= new Date().toISOString().slice(0, 10)) return { error: "A semester can only be completed after its end date." };

  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select("id, year_of_study, membership_status, membership_activated_at")
    .in("membership_status", ["active", "inactive"]);
  if (membersError) return { error: membersError.message };

  const { data: completedSemesters, error: completedError } = await supabase
    .from("semesters")
    .select("id, starts_on, ends_on")
    .not("completed_at", "is", null)
    .lte("ends_on", semester.ends_on)
    .order("ends_on", { ascending: true });
  if (completedError) return { error: completedError.message };

  const completedWithCurrent = [...(completedSemesters ?? []), {
    id: semester.id,
    starts_on: semester.starts_on,
    ends_on: semester.ends_on,
  }];
  const { data: existingProgressions, error: progressionError } = await supabase
    .from("member_progressions")
    .select("member_id, semester_id")
    .in("member_id", (members ?? []).map((member) => member.id));
  if (progressionError) return { error: progressionError.message };

  const progressionCounts = new Map<string, number>();
  for (const progression of existingProgressions ?? []) {
    progressionCounts.set(progression.member_id, (progressionCounts.get(progression.member_id) ?? 0) + 1);
  }

  let progressed = 0;
  for (const member of members ?? []) {
    const activationDate = member.membership_activated_at?.slice(0, 10);
    const eligibleSemesterCount = completedWithCurrent.filter((item) => !activationDate || item.ends_on >= activationDate).length;
    const targetProgressions = Math.floor(eligibleSemesterCount / 2);
    const currentProgressions = progressionCounts.get(member.id) ?? 0;
    if (targetProgressions <= currentProgressions) continue;

    const nextStatus = member.year_of_study >= 4 ? "alumni" : member.membership_status;
    const nextYear = member.year_of_study >= 4 ? null : member.year_of_study + 1;
    const { error: insertError } = await supabase.from("member_progressions").insert({
      member_id: member.id,
      semester_id: semester.id,
      previous_year: member.year_of_study,
      next_year: nextYear,
      previous_status: member.membership_status,
      next_status: nextStatus,
      processed_by: user.id,
    });
    if (insertError) {
      if (insertError.code === "23505") continue;
      return { error: insertError.message };
    }

    const { error: updateError } = await supabase.from("profiles").update({
      year_of_study: nextYear ?? member.year_of_study,
      membership_status: nextStatus,
    }).eq("id", member.id);
    if (updateError) return { error: updateError.message };
    await recordAuditEvent({
      action: "member_progressed",
      entityType: "profile",
      entityId: member.id,
      beforeData: { year_of_study: member.year_of_study, membership_status: member.membership_status },
      afterData: { year_of_study: nextYear, membership_status: nextStatus, semester_id: semester.id },
    });
    progressed += 1;
  }

  const completedAt = new Date().toISOString();
  const { error: completeError } = await supabase.from("semesters").update({
    completed_at: completedAt,
    completed_by: user.id,
    is_active: false,
  }).eq("id", semester.id);
  if (completeError) return { error: completeError.message };
  await recordAuditEvent({
    action: "semester_completed",
    entityType: "semester",
    entityId: semester.id,
    afterData: { completed_at: completedAt, progressed_members: progressed },
  });

  revalidatePath("/admin/semesters");
  revalidatePath("/admin/members");
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, progressed };
}

// ---------------------------------------------------------------------------
// MEMBERS
// ---------------------------------------------------------------------------
export async function updateMemberDetails(memberId: string, formData: FormData) {
  const parsedMemberId = uuidSchema.safeParse(memberId);
  if (!parsedMemberId.success) return { error: "Invalid member." };

  const parsed = memberDetailsSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    program: String(formData.get("program") ?? ""),
    year_of_study: formData.get("year_of_study"),
    sex: String(formData.get("sex") ?? ""),
    phone_number: String(formData.get("phone_number") ?? ""),
    holiday_residence: String(formData.get("holiday_residence") ?? ""),
    learning_expectations: String(formData.get("learning_expectations") ?? ""),
    preferred_placement: String(formData.get("preferred_placement") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid member details." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRole || !canManageOperations(adminRole.role as AdminRoleName)) {
    return { error: "Only an administrator can edit member details." };
  }

  const { data: previous } = await supabase
    .from("profiles")
    .select("full_name, program, year_of_study, sex, phone_number, holiday_residence, learning_expectations, preferred_placement")
    .eq("id", parsedMemberId.data)
    .maybeSingle();
  if (!previous) return { error: "Member not found." };

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", parsedMemberId.data);
  if (error) return { error: "Unable to update member details." };

  await recordAuditEvent({
    action: "member_details_updated",
    entityType: "profile",
    entityId: parsedMemberId.data,
    beforeData: previous,
    afterData: parsed.data,
  });

  revalidatePath("/admin/members");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function setMemberPaymentStatus(memberId: string, paid: boolean) {
  const parsedMemberId = uuidSchema.safeParse(memberId);
  if (!parsedMemberId.success) return { error: "Invalid member." };
  if (typeof paid !== "boolean") return { error: "Invalid payment status." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRole || !canManageOperations(adminRole.role as AdminRoleName)) {
    return { error: "Only an operations administrator can update payment status." };
  }

  const { data: previous, error: previousError } = await supabase
    .from("profiles")
    .select("payment_verified, last_payment_date")
    .eq("id", parsedMemberId.data)
    .maybeSingle();
  if (previousError) return { error: `Unable to read payment status: ${previousError.message}` };
  if (!previous) return { error: "Member not found." };

  const nextPaymentDate = paid ? new Date().toISOString() : null;
  const { error } = await supabase
    .from("profiles")
    .update({ payment_verified: paid, last_payment_date: nextPaymentDate })
    .eq("id", parsedMemberId.data);
  if (error) return { error: `Unable to update payment status: ${error.message}` };

  await recordAuditEvent({
    action: "member_payment_status_changed",
    entityType: "profile",
    entityId: parsedMemberId.data,
    beforeData: previous,
    afterData: { payment_verified: paid, last_payment_date: nextPaymentDate },
  });

  revalidatePath("/admin/members");
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function setMembershipStatus(memberId: string, status: MembershipStatus) {
  const parsedMemberId = uuidSchema.safeParse(memberId);
  if (!parsedMemberId.success) return { error: "Invalid member." };

  const supabase = createClient();
  const { data: previous } = await supabase
    .from("profiles")
    .select("membership_status, membership_activated_at")
    .eq("id", parsedMemberId.data)
    .maybeSingle();
  if (!previous) return { error: "Member not found." };

  const activationDate = status === "active"
    ? previous.membership_activated_at ?? new Date().toISOString()
    : previous.membership_activated_at;
  const { error } = await supabase
    .from("profiles")
    .update({ membership_status: status, membership_activated_at: activationDate })
    .eq("id", parsedMemberId.data);
  if (error) return { error: error.message };

  await recordAuditEvent({
    action: "membership_status_changed",
    entityType: "profile",
    entityId: parsedMemberId.data,
    beforeData: previous,
    afterData: { membership_status: status, membership_activated_at: activationDate },
  });

  revalidatePath("/admin/members");
  return { success: true };
}

export async function bulkSetMembershipStatus(memberIds: string[], status: MembershipStatus) {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return { error: "Select at least one member." };
  }

  const normalizedIds = [...new Set(memberIds.filter((id) => typeof id === "string" && !!id.trim()))];
  if (normalizedIds.length === 0) {
    return { error: "Select at least one valid member." };
  }

  const supabase = createClient();
  const { data: members, error: selectError } = await supabase
    .from("profiles")
    .select("id, membership_status, membership_activated_at")
    .in("id", normalizedIds);

  if (selectError) return { error: selectError.message };

  if (!members || members.length === 0) return { error: "No matching members found." };

  const activationDate = status === "active" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("profiles")
    .update({ membership_status: status, membership_activated_at: status === "active" ? activationDate : null })
    .in("id", normalizedIds);

  if (error) return { error: error.message };

  for (const member of members) {
    await recordAuditEvent({
      action: "membership_status_changed",
      entityType: "profile",
      entityId: member.id,
      beforeData: { membership_status: member.membership_status, membership_activated_at: member.membership_activated_at },
      afterData: { membership_status: status, membership_activated_at: status === "active" ? activationDate : null },
      reason: "bulk_member_status_update",
    });
  }

  revalidatePath("/admin/members");
  return { success: true, updated: members.length };
}

// ---------------------------------------------------------------------------
// MEETINGS
// ---------------------------------------------------------------------------
export type MeetingFormState = { error?: string; success?: boolean };

async function findMeetingSemester(date: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("id")
    .lte("starts_on", date)
    .gte("ends_on", date);
  if (error) return { error: `Unable to find a semester for this meeting: ${error.message}` };
  if (!data || data.length === 0) return { error: "Create or activate a semester that includes this meeting date first." };
  if (data.length > 1) return { error: "This meeting date falls into overlapping semesters. Fix the semester dates first." };
  return { semesterId: data[0].id };
}

export async function createMeeting(
  _previousState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const parsed = meetingSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    venue: String(formData.get("venue") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid meeting details." };

  const semester = await findMeetingSemester(parsed.data.date);
  if (semester.error) return { error: semester.error };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: meeting, error } = await supabase.from("meetings").insert({
    ...parsed.data,
    semester_id: semester.semesterId,
    created_by: user?.id,
  }).select("id").single();

  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "meeting_created",
    entityType: "meeting",
    entityId: meeting.id,
    afterData: parsed.data,
  });

  revalidatePath("/admin/meetings");
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function updateMeeting(
  meetingId: string,
  _previousState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const parsedMeetingId = uuidSchema.safeParse(meetingId);
  const parsed = meetingSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    venue: String(formData.get("venue") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsedMeetingId.success || !parsed.success) return { error: "Invalid meeting details." };

  const semester = await findMeetingSemester(parsed.data.date);
  if (semester.error) return { error: semester.error };

  const supabase = createClient();
  const { data: previous } = await supabase.from("meetings").select("*").eq("id", parsedMeetingId.data).maybeSingle();
  if (!previous) return { error: "Meeting not found." };

  const { error } = await supabase.from("meetings").update({ ...parsed.data, semester_id: semester.semesterId }).eq("id", parsedMeetingId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "meeting_updated",
    entityType: "meeting",
    entityId: parsedMeetingId.data,
    beforeData: previous,
    afterData: parsed.data,
  });

  revalidatePath("/admin/meetings");
  revalidatePath("/admin/reports");
  revalidatePath("/");
  revalidatePath("/dashboard/meetings");
  return { success: true };
}

export async function toggleAttendanceOpen(meetingId: string, open: boolean) {
  const parsedMeetingId = uuidSchema.safeParse(meetingId);
  if (!parsedMeetingId.success || typeof open !== "boolean") return { error: "Invalid meeting update." };

  const supabase = createClient();
  const { data: previous } = await supabase
    .from("meetings")
    .select("attendance_open")
    .eq("id", parsedMeetingId.data)
    .maybeSingle();
  if (!previous) return { error: "Meeting not found." };

  const { error } = await supabase.from("meetings").update({ attendance_open: open }).eq("id", parsedMeetingId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: open ? "attendance_opened" : "attendance_closed",
    entityType: "meeting",
    entityId: parsedMeetingId.data,
    beforeData: { attendance_open: previous.attendance_open },
    afterData: { attendance_open: open },
  });

  revalidatePath("/admin/meetings");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/attendance");
  return { success: true };
}

export async function deleteMeeting(meetingId: string) {
  const parsedMeetingId = uuidSchema.safeParse(meetingId);
  if (!parsedMeetingId.success) return { error: "Invalid meeting." };

  const supabase = createClient();
  const { data: meeting } = await supabase.from("meetings").select("*").eq("id", parsedMeetingId.data).maybeSingle();
  if (!meeting) return { error: "Meeting not found." };

  const { error } = await supabase.from("meetings").delete().eq("id", parsedMeetingId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "meeting_deleted",
    entityType: "meeting",
    entityId: parsedMeetingId.data,
    beforeData: meeting,
  });

  revalidatePath("/admin/meetings");
  return { success: true };
}

// ---------------------------------------------------------------------------
// POSTS (updates & stories)
// ---------------------------------------------------------------------------
export type PostFormState = { error?: string; success?: boolean };

export async function createPost(
  postType: PostType,
  _previousState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsedType = postTypeSchema.safeParse(postType);
  const parsed = postSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    content: String(formData.get("content") ?? ""),
    cover_image: String(formData.get("cover_image") ?? ""),
    category: String(formData.get("category") ?? ""),
    author_name: String(formData.get("author_name") ?? ""),
    is_featured: formData.get("is_featured") === "on",
    featured_order: String(formData.get("featured_order") ?? "0"),
  });
  if (!parsedType.success || !parsed.success) return { error: "Please provide valid post details." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase.from("posts").insert({
    title: parsed.data.title,
    short_description: parsed.data.short_description || null,
    content: parsed.data.content,
    cover_image: parsed.data.cover_image || null,
    category: parsed.data.category || null,
    author_id: user?.id,
    author_name: parsed.data.author_name || null,
    post_type: parsedType.data,
    published: formData.get("published") === "on",
    is_featured: parsed.data.is_featured,
    featured_order: parsed.data.is_featured ? parsed.data.featured_order : 0,
  }).select("id").single();

  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "post_created",
    entityType: "post",
    entityId: post.id,
    afterData: { ...parsed.data, post_type: parsedType.data, published: formData.get("published") === "on" },
  });

  revalidatePath(postType === "story" ? "/admin/stories" : "/admin/updates");
  revalidatePath(postType === "story" ? "/stories" : "/updates");
  revalidatePath("/");
  return { success: true };
}

export async function updatePost(
  postId: string,
  postType: PostType,
  _previousState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsedPostId = uuidSchema.safeParse(postId);
  const parsedType = postTypeSchema.safeParse(postType);
  const parsed = postSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    content: String(formData.get("content") ?? ""),
    cover_image: String(formData.get("cover_image") ?? ""),
    category: String(formData.get("category") ?? ""),
    author_name: String(formData.get("author_name") ?? ""),
    is_featured: formData.get("is_featured") === "on",
    featured_order: String(formData.get("featured_order") ?? "0"),
  });
  if (!parsedPostId.success || !parsedType.success || !parsed.success) return { error: "Invalid post details." };

  const supabase = createClient();
  const { data: previous } = await supabase.from("posts").select("*").eq("id", parsedPostId.data).maybeSingle();
  if (!previous) return { error: "Post not found." };

  const update = {
    title: parsed.data.title,
    short_description: parsed.data.short_description || null,
    content: parsed.data.content,
    cover_image: parsed.data.cover_image || null,
    category: parsed.data.category || null,
    author_name: parsed.data.author_name || null,
    published: formData.get("published") === "on",
    is_featured: parsed.data.is_featured,
    featured_order: parsed.data.is_featured ? parsed.data.featured_order : 0,
  };
  const { error } = await supabase.from("posts").update(update).eq("id", parsedPostId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "post_updated",
    entityType: "post",
    entityId: parsedPostId.data,
    beforeData: previous,
    afterData: update,
  });

  revalidatePath(postType === "story" ? "/admin/stories" : "/admin/updates");
  revalidatePath(postType === "story" ? "/stories" : "/updates");
  revalidatePath("/");
  return { success: true };
}

export async function togglePublished(postId: string, published: boolean, postType: PostType) {
  const parsedPostId = uuidSchema.safeParse(postId);
  const parsedType = postTypeSchema.safeParse(postType);
  if (!parsedPostId.success || !parsedType.success || typeof published !== "boolean") return { error: "Invalid post update." };

  const supabase = createClient();
  const { data: previous } = await supabase.from("posts").select("published").eq("id", parsedPostId.data).maybeSingle();
  if (!previous) return { error: "Post not found." };

  const { error } = await supabase.from("posts").update({ published }).eq("id", parsedPostId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: published ? "post_published" : "post_unpublished",
    entityType: "post",
    entityId: parsedPostId.data,
    beforeData: { published: previous.published },
    afterData: { published },
  });

  revalidatePath(postType === "story" ? "/admin/stories" : "/admin/updates");
  revalidatePath(postType === "story" ? "/stories" : "/updates");
  return { success: true };
}

export async function deletePost(postId: string, postType: PostType) {
  const parsedPostId = uuidSchema.safeParse(postId);
  const parsedType = postTypeSchema.safeParse(postType);
  if (!parsedPostId.success || !parsedType.success) return { error: "Invalid post." };

  const supabase = createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("id", parsedPostId.data).maybeSingle();
  if (!post) return { error: "Post not found." };

  const { error } = await supabase.from("posts").delete().eq("id", parsedPostId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "post_deleted",
    entityType: "post",
    entityId: parsedPostId.data,
    beforeData: post,
  });

  revalidatePath(postType === "story" ? "/admin/stories" : "/admin/updates");
  return { success: true };
}

// ---------------------------------------------------------------------------
// GALLERY
// Image upload itself happens client-side straight to Supabase Storage
// (see app/admin/gallery/UploadForm.tsx); this action just records the
// resulting public URL in the `gallery` table.
// ---------------------------------------------------------------------------
export async function addGalleryImage(
  imageUrl: string,
  caption: string,
  category: string,
  isFeatured = false,
  featuredOrder = 0
) {
  const parsedUrl = z.string().url().safeParse(imageUrl);
  const parsedOrder = z.coerce.number().int().min(0).max(10000).safeParse(featuredOrder);
  if (!parsedUrl.success || !parsedOrder.success || caption.length > 500 || category.length > 100) {
    return { error: "Invalid gallery details." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: image, error } = await supabase.from("gallery").insert({
    image_url: parsedUrl.data,
    caption,
    category,
    is_featured: isFeatured,
    featured_order: isFeatured ? parsedOrder.data : 0,
    uploaded_by: user?.id,
  }).select("id").single();

  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "gallery_image_added",
    entityType: "gallery",
    entityId: image.id,
    afterData: { image_url: parsedUrl.data, caption, category, is_featured: isFeatured, featured_order: isFeatured ? parsedOrder.data : 0 },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function updateGalleryImage(
  id: string,
  caption: string,
  category: string,
  isFeatured = false,
  featuredOrder = 0
) {
  const parsedId = uuidSchema.safeParse(id);
  const parsedCaption = z.string().max(500).safeParse(caption);
  const parsedCategory = z.string().max(100).safeParse(category);
  const parsedOrder = z.coerce.number().int().min(0).max(10000).safeParse(featuredOrder);
  if (!parsedId.success || !parsedCaption.success || !parsedCategory.success || !parsedOrder.success) {
    return { error: "Invalid gallery details." };
  }

  const supabase = createClient();
  const { data: previous } = await supabase.from("gallery").select("*").eq("id", parsedId.data).maybeSingle();
  if (!previous) return { error: "Gallery image not found." };

  const update = {
    caption: parsedCaption.data.trim() || null,
    category: parsedCategory.data.trim() || null,
    is_featured: isFeatured,
    featured_order: isFeatured ? parsedOrder.data : 0,
  };
  const { error } = await supabase.from("gallery").update(update).eq("id", parsedId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "gallery_image_updated",
    entityType: "gallery",
    entityId: parsedId.data,
    beforeData: previous,
    afterData: update,
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGalleryImage(id: string) {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid gallery image." };

  const supabase = createClient();
  const { data: image } = await supabase.from("gallery").select("*").eq("id", parsedId.data).maybeSingle();
  if (!image) return { error: "Gallery image not found." };

  const { error } = await supabase.from("gallery").delete().eq("id", parsedId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "gallery_image_deleted",
    entityType: "gallery",
    entityId: parsedId.data,
    beforeData: image,
  });

  revalidatePath("/admin/gallery");
  return { success: true };
}

// ---------------------------------------------------------------------------
// ADMINISTRATORS (super admin only, enforced by RLS on admin_roles)
// ---------------------------------------------------------------------------
async function confirmCurrentPassword(
  supabase: ReturnType<typeof createClient>,
  auth: { userId: string },
  password: string
) {
  const { data: currentUser } = await supabase.auth.getUser();
  if (!currentUser.user?.email) return false;

  const { data: reauthenticated, error } = await supabase.auth.signInWithPassword({
    email: currentUser.user.email,
    password,
  });

  return !error && reauthenticated.user?.id === auth.userId;
}

// Admins are granted a role by selecting an existing member (an approved
// profile) from a dropdown in the Administrators page. This avoids needing
// a separate email-lookup RPC that would require the service role key.
export async function addAdministratorById(userId: string, role: AdminRoleName, password: string) {
  const parsedUserId = uuidSchema.safeParse(userId);
  const parsedRole = adminRoleSchema.safeParse(role);
  const parsedPassword = z.string().min(8, "Enter your current password to confirm this change.").safeParse(password);
  if (!parsedUserId.success || !parsedRole.success || !parsedPassword.success) {
    return { error: parsedPassword.success ? "Invalid administrator details." : parsedPassword.error.issues[0].message };
  }

  const supabase = createClient();
  const auth = await getAuthContext();
  if (!auth || !isSuperAdmin(auth.role)) return { error: "Only a Super Admin can manage administrators." };

  if (!(await confirmCurrentPassword(supabase, auth, parsedPassword.data))) {
    return { error: "Password confirmation failed. No administrator access was changed." };
  }

  const { data: member } = await supabase
    .from("profiles")
    .select("membership_status")
    .eq("id", parsedUserId.data)
    .maybeSingle();
  if (!member || member.membership_status !== "active") {
    return { error: "Only active members can become administrators." };
  }

  const { data: previous } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", parsedUserId.data)
    .maybeSingle();

  const { error } = await supabase
    .from("admin_roles")
    .upsert({ user_id: parsedUserId.data, role: parsedRole.data, granted_by: auth.userId }, { onConflict: "user_id" });

  if (error) return { error: error.message };
  await recordAuditEvent({
    action: previous ? "administrator_role_changed" : "administrator_granted",
    entityType: "admin_role",
    entityId: parsedUserId.data,
    beforeData: previous ? { role: previous.role } : null,
    afterData: { role: parsedRole.data, granted_by: auth.userId },
  });

  revalidatePath("/admin/administrators");
  return { success: true };
}

export async function updateSiteAnnouncement(message: string) {
  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.length > 500) {
    return { error: "Announcement must be 1-500 characters long." };
  }

  const supabase = createClient();
  const auth = await getAuthContext();
  if (!auth || (auth.role !== "super_admin" && auth.role !== "administrator")) {
    return { error: "Only an Administrator can update landing page settings." };
  }

  const { data: previous } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "announcement_text")
    .maybeSingle();

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "announcement_text", value: trimmed, updated_by: auth.userId }, { onConflict: "key" });

  if (error) return { error: error.message };

  await recordAuditEvent({
    action: "site_announcement_updated",
    entityType: "site_setting",
    entityId: "announcement_text",
    beforeData: previous ? { value: previous.value } : null,
    afterData: { value: trimmed },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

async function updateLandingSettingsSection(
  formData: FormData,
  schema: z.AnyZodObject,
  fields: string[],
  action: string
) {
  const input = Object.fromEntries(fields.map((field) => [
    field,
    field.startsWith("show_") ? formData.get(field) === "on" : String(formData.get(field) ?? ""),
  ]));
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid landing page settings." };

  const supabase = createClient();
  const auth = await getAuthContext();
  if (!auth || (auth.role !== "super_admin" && auth.role !== "administrator")) {
    return { error: "Only an Administrator can update landing page settings." };
  }

  const { data: previous } = await supabase
    .from("landing_page_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  const update = { ...parsed.data, updated_by: auth.userId };
  const { error } = await supabase
    .from("landing_page_settings")
    .upsert({ id: true, ...update }, { onConflict: "id" });
  if (error) return { error: error.message };

  await recordAuditEvent({
    action,
    entityType: "landing_page_settings",
    entityId: "default",
    beforeData: previous,
    afterData: update,
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateLandingPageSettings(formData: FormData) {
  return updateLandingSettingsSection(
    formData,
    landingPageContentSchema,
    [
      "hero_eyebrow", "hero_title", "hero_description", "hero_image",
      "intro_heading", "intro_content", "intro_image", "intro_image_alt",
      "show_announcement", "show_intro", "show_meeting", "show_stories", "show_updates", "show_gallery",
      "seo_title", "seo_description", "social_image",
    ],
    "landing_page_content_updated"
  );
}

export async function updateAboutPageSettings(formData: FormData) {
  return updateLandingSettingsSection(
    formData,
    aboutPageSettingsSchema,
    ["about_heading", "about_content", "about_image", "about_image_alt"],
    "about_page_settings_updated"
  );
}

export async function updateFooterSettings(formData: FormData) {
  return updateLandingSettingsSection(
    formData,
    footerSettingsSchema,
    ["footer_description", "footer_address", "footer_email", "footer_phone_1", "footer_phone_2", "footer_copyright"],
    "footer_settings_updated"
  );
}

export async function removeAdministrator(userId: string, password: string) {
  const parsedUserId = uuidSchema.safeParse(userId);
  const parsedPassword = z.string().min(8, "Enter your current password to confirm this change.").safeParse(password);
  if (!parsedUserId.success) return { error: "Invalid administrator." };
  if (!parsedPassword.success) return { error: parsedPassword.error.issues[0].message };

  const supabase = createClient();
  const auth = await getAuthContext();
  if (!auth || !isSuperAdmin(auth.role)) return { error: "Only a Super Admin can manage administrators." };
  if (parsedUserId.data === auth.userId) return { error: "You cannot remove your own administrator access." };
  if (!(await confirmCurrentPassword(supabase, auth, parsedPassword.data))) {
    return { error: "Password confirmation failed. No administrator access was changed." };
  }

  const { data: target } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", parsedUserId.data)
    .maybeSingle();
  if (!target) return { error: "Administrator not found." };

  if (target.role === "super_admin") {
    const { count } = await supabase
      .from("admin_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");
    if ((count ?? 0) <= 1) return { error: "The last Super Admin cannot be removed." };
  }

  const { error } = await supabase.from("admin_roles").delete().eq("user_id", parsedUserId.data);
  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "administrator_revoked",
    entityType: "admin_role",
    entityId: parsedUserId.data,
    beforeData: { role: target.role },
    afterData: null,
  });

  revalidatePath("/admin/administrators");
  return { success: true };
}
