import { createClient } from "@/lib/supabase/server";
import type { Meeting, Post, Notification, GalleryImage, Semester, LandingPageSettings, CustomSection } from "@/types/database";

export const defaultLandingPageSettings: Omit<LandingPageSettings, "id" | "updated_by" | "updated_at"> = {
  hero_eyebrow: "University of Malawi",
  hero_title: "UNIMA Gavel Club",
  hero_description: "A student community focused on developing communication, public speaking, leadership and confidence.",
  hero_image: null,
  primary_cta_label: "Join the Club",
  primary_cta_url: "/join",
  secondary_cta_label: "Member Login",
  secondary_cta_url: "/login",
  intro_heading: "Who we are",
  intro_content: "The UNIMA Gavel Club brings together students who want to become confident, persuasive and thoughtful communicators. Through regular meetings, prepared speeches, impromptu challenges and leadership roles, our members build the skills that carry into classrooms, interviews and every room they will one day lead.\n\nWhether you are terrified of public speaking or already love the stage, there is a place for you here.",
  intro_image: null,
  intro_image_alt: "Students in discussion on campus",
  about_heading: "About UNIMA Gavel Club",
  about_content: "The UNIMA Toastmasters Gavel Club is a student-led community at the University of Malawi built around one goal: helping members become confident, capable communicators and leaders.\n\nThrough regular meetings, prepared and impromptu speeches, evaluation, and rotating leadership roles, members practice real skills in a supportive environment, skills that carry far beyond the meeting room.\n\nWhatever brought you here, whether overcoming a fear of public speaking, sharpening your leadership, or simply finding a community of ambitious peers, there is a place for you at Gavel Club.",
  about_image: null,
  about_image_alt: "Students at a leadership meeting",
  footer_description: "A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.",
  footer_address: "University of Malawi, Zomba, Malawi",
  footer_email: "gavelclub@unima.ac.mw",
  footer_phone_1: null,
  footer_phone_2: null,
  footer_instagram_url: null,
  footer_tiktok_url: null,
  footer_copyright: "UNIMA Toastmasters Gavel Club. All rights reserved.",
  show_announcement: true,
  show_intro: true,
  show_meeting: true,
  show_stories: true,
  show_updates: true,
  show_gallery: true,
  gallery_drive_url: null,
  seo_title: "UNIMA Gavel Club | University of Malawi Toastmasters",
  seo_description: "A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.",
  social_image: null,
};

export async function getLandingPageSettings(): Promise<typeof defaultLandingPageSettings> {
  const supabase = createClient();
  const { data } = await supabase.from("landing_page_settings").select("*").eq("id", true).maybeSingle();
  return { ...defaultLandingPageSettings, ...(data ?? {}) };
}

export async function getCustomSections(): Promise<CustomSection[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("custom_sections")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data as CustomSection[]) ?? [];
}

export async function getActiveSemester(): Promise<Semester | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("semesters")
    .select("id, name, starts_on, ends_on, is_active, created_at")
    .eq("is_active", true)
    .maybeSingle();
  return data as Semester | null;
}

export async function getUpcomingMeeting(): Promise<Meeting | null> {
  const semester = await getActiveSemester();
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("meetings")
    .select("id, title, date, time, venue, description, attendance_open, created_by, created_at")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (semester) {
    query = query.eq("semester_id", semester.id);
  } else {
    return null;
  }

  const { data } = await query.limit(1).maybeSingle();
  return data as Meeting | null;
}

export async function getLatestPosts(type: "story" | "update", limit = 3): Promise<Post[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, short_description, cover_image, author_name, post_type, category, is_featured, featured_order, created_at")
    .eq("post_type", type)
    .eq("published", true)
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Post[]) ?? [];
}

// Notification system disabled for now. TODO: rebuild this as a proper in-app
// feed with explicit privacy rules, user visibility controls, and admin tooling.
export async function getMemberNotifications(limit = 5): Promise<Notification[]> {
  void limit;
  return [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  return 0;
}

export async function getGalleryPreview(limit = 8): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("gallery")
    .select("id, image_url, caption, is_featured, featured_order")
    .not("category", "ilike", "%executive%")
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as GalleryImage[]) ?? [];
}

export async function getExecutiveMembers(): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("gallery")
    .select("id, image_url, caption, category, is_featured, featured_order, uploaded_by, created_at")
    .ilike("category", "%executive%")
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data as GalleryImage[]) ?? [];
}

export async function getSiteAnnouncement(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "announcement_text")
    .maybeSingle();

  return (data?.value as string | null) ?? null;
}

export async function getWhatsAppGroupLink(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "whatsapp_group_link")
    .maybeSingle();

  return (data?.value as string | null) ?? "";
}

export async function getMembershipPaymentDetails() {
  const supabase = createClient();
  const keys = [
    "membership_fee_amount",
    "membership_fee_bank_nb_name",
    "membership_fee_bank_nb_number",
    "membership_fee_mpamba_name",
    "membership_fee_mpamba_number",
    "membership_fee_airtel_money_name",
    "membership_fee_airtel_money_number",
  ];
  const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);

  const values = {
    membership_fee_amount: "",
    bank_nb_name: "",
    bank_nb_number: "",
    mpamba_name: "",
    mpamba_number: "",
    airtel_money_name: "",
    airtel_money_number: "",
  };

  for (const row of data ?? []) {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    if (row.key === "membership_fee_amount") values.membership_fee_amount = value;
    if (row.key === "membership_fee_bank_nb_name") values.bank_nb_name = value;
    if (row.key === "membership_fee_bank_nb_number") values.bank_nb_number = value;
    if (row.key === "membership_fee_mpamba_name") values.mpamba_name = value;
    if (row.key === "membership_fee_mpamba_number") values.mpamba_number = value;
    if (row.key === "membership_fee_airtel_money_name") values.airtel_money_name = value;
    if (row.key === "membership_fee_airtel_money_number") values.airtel_money_number = value;
  }

  return values;
}

export async function getUpcomingMeetings(limit = 5): Promise<Meeting[]> {
  const semester = await getActiveSemester();
  if (!semester) return [];

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("meetings")
    .select("*")
    .eq("semester_id", semester.id)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(limit);
  return (data as Meeting[]) ?? [];
}

export async function getMemberAttendanceHistory(memberId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("attendance")
    .select("id, meeting_id, checked_in_at, meetings(id, title, date)")
    .eq("member_id", memberId)
    .order("checked_in_at", { ascending: false });
  return data ?? [];
}

export async function getMeetingCount() {
  const supabase = createClient();
  const { count } = await supabase.from("meetings").select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getActiveSemesterMeetings(): Promise<Meeting[]> {
  const semester = await getActiveSemester();
  if (!semester) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("meetings")
    .select("id, title, date, time, venue, description, attendance_open, created_by, created_at")
    .eq("semester_id", semester.id)
    .order("date", { ascending: true });
  return (data as Meeting[]) ?? [];
}

export async function getCurrentUserProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, isAdmin: false, adminRole: null as string | null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: adminRow } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile, isAdmin: !!adminRow, adminRole: adminRow?.role ?? null };
}
