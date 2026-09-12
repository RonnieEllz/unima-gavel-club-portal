import { createClient } from "@/lib/supabase/server";
import type { Meeting, Post, GalleryImage, Semester, LandingPageSettings } from "@/types/database";

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
  show_announcement: true,
  show_intro: true,
  show_meeting: true,
  show_stories: true,
  show_updates: true,
  show_gallery: true,
  seo_title: "UNIMA Gavel Club | University of Malawi Toastmasters",
  seo_description: "A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.",
  social_image: null,
};

export async function getLandingPageSettings(): Promise<typeof defaultLandingPageSettings> {
  const supabase = createClient();
  const { data } = await supabase.from("landing_page_settings").select("*").eq("id", true).maybeSingle();
  return { ...defaultLandingPageSettings, ...(data ?? {}) };
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
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("meetings")
    .select("id, title, date, time, venue, description, attendance_open, created_by, created_at")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();
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

export async function getGalleryPreview(limit = 8): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("gallery")
    .select("id, image_url, caption, is_featured, featured_order")
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
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

export async function getUpcomingMeetings(limit = 5): Promise<Meeting[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("meetings")
    .select("*")
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
