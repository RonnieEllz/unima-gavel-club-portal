"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, PostType, AdminRoleName } from "@/types/database";
import { getAuthContext, isSuperAdmin } from "@/lib/authz";
import { canManageOperations } from "@/lib/role-policy";
import { recordAuditEvent } from "@/lib/actions/audit";
import {
  adminRoleSchema,
  meetingSchema,
  memberDetailsSchema,
  postSchema,
  postTypeSchema,
  uuidSchema,
} from "@/lib/validation";

// Every function here relies on Postgres RLS (is_admin() / is_super_admin() /
// has_content_access()) as the real authorization check. If the calling user
// lacks the right role, Supabase returns an error and nothing is written.
// these actions do not themselves decide who is allowed to do what.

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

export async function setMembershipStatus(memberId: string, status: MembershipStatus) {
  const parsedMemberId = uuidSchema.safeParse(memberId);
  if (!parsedMemberId.success) return { error: "Invalid member." };

  const supabase = createClient();
  const { data: previous } = await supabase
    .from("profiles")
    .select("membership_status")
    .eq("id", parsedMemberId.data)
    .maybeSingle();
  if (!previous) return { error: "Member not found." };

  const { error } = await supabase.from("profiles").update({ membership_status: status }).eq("id", parsedMemberId.data);
  if (error) return { error: error.message };

  await recordAuditEvent({
    action: "membership_status_changed",
    entityType: "profile",
    entityId: parsedMemberId.data,
    beforeData: { membership_status: previous.membership_status },
    afterData: { membership_status: status },
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
    .select("id, membership_status")
    .in("id", normalizedIds);

  if (selectError) return { error: selectError.message };

  if (!members || members.length === 0) return { error: "No matching members found." };

  const beforeData = members.map((member) => ({
    id: member.id,
    membership_status: member.membership_status,
  }));

  const { error } = await supabase
    .from("profiles")
    .update({ membership_status: status })
    .in("id", normalizedIds);

  if (error) return { error: error.message };

  for (const member of members) {
    await recordAuditEvent({
      action: "membership_status_changed",
      entityType: "profile",
      entityId: member.id,
      beforeData: { membership_status: member.membership_status },
      afterData: { membership_status: status },
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

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: meeting, error } = await supabase.from("meetings").insert({
    ...parsed.data,
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

  const supabase = createClient();
  const { data: previous } = await supabase.from("meetings").select("*").eq("id", parsedMeetingId.data).maybeSingle();
  if (!previous) return { error: "Meeting not found." };

  const { error } = await supabase.from("meetings").update(parsed.data).eq("id", parsedMeetingId.data);
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
export async function addGalleryImage(imageUrl: string, caption: string, category: string) {
  const parsedUrl = z.string().url().safeParse(imageUrl);
  if (!parsedUrl.success || caption.length > 500 || category.length > 100) return { error: "Invalid gallery details." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: image, error } = await supabase.from("gallery").insert({
    image_url: parsedUrl.data,
    caption,
    category,
    uploaded_by: user?.id,
  }).select("id").single();

  if (error) return { error: error.message };
  await recordAuditEvent({
    action: "gallery_image_added",
    entityType: "gallery",
    entityId: image.id,
    afterData: { image_url: parsedUrl.data, caption, category },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function updateGalleryImage(id: string, caption: string, category: string) {
  const parsedId = uuidSchema.safeParse(id);
  const parsedCaption = z.string().max(500).safeParse(caption);
  const parsedCategory = z.string().max(100).safeParse(category);
  if (!parsedId.success || !parsedCaption.success || !parsedCategory.success) {
    return { error: "Invalid gallery details." };
  }

  const supabase = createClient();
  const { data: previous } = await supabase.from("gallery").select("*").eq("id", parsedId.data).maybeSingle();
  if (!previous) return { error: "Gallery image not found." };

  const update = {
    caption: parsedCaption.data.trim() || null,
    category: parsedCategory.data.trim() || null,
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
async function confirmSuperAdminPassword(
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

  if (!(await confirmSuperAdminPassword(supabase, auth, parsedPassword.data))) {
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
  if (!auth || !isSuperAdmin(auth.role)) return { error: "Only a Super Admin can update the site announcement." };

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

export async function removeAdministrator(userId: string, password: string) {
  const parsedUserId = uuidSchema.safeParse(userId);
  const parsedPassword = z.string().min(8, "Enter your current password to confirm this change.").safeParse(password);
  if (!parsedUserId.success) return { error: "Invalid administrator." };
  if (!parsedPassword.success) return { error: parsedPassword.error.issues[0].message };

  const supabase = createClient();
  const auth = await getAuthContext();
  if (!auth || !isSuperAdmin(auth.role)) return { error: "Only a Super Admin can manage administrators." };
  if (parsedUserId.data === auth.userId) return { error: "You cannot remove your own administrator access." };
  if (!(await confirmSuperAdminPassword(supabase, auth, parsedPassword.data))) {
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
