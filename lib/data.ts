import { createClient } from "@/lib/supabase/server";
import type { Meeting, Post, GalleryImage } from "@/types/database";

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
    .select("id, title, short_description, cover_image, author_name, post_type, category, created_at")
    .eq("post_type", type)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Post[]) ?? [];
}

export async function getGalleryPreview(limit = 8): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("gallery")
    .select("id, image_url, caption")
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
    .select("id, checked_in_at, meetings(id, title, date)")
    .eq("member_id", memberId)
    .order("checked_in_at", { ascending: false });
  return data ?? [];
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
