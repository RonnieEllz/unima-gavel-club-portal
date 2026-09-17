export type MembershipStatus = "pending" | "active" | "inactive" | "rejected" | "alumni";
export type MemberSex = "male" | "female";
export type PostType = "update" | "story";
export type AdminRoleName = "super_admin" | "administrator" | "operations_admin" | "content_administrator";

export interface Profile {
  id: string;
  full_name: string;
  program: string;
  year_of_study: number;
  sex: MemberSex;
  phone_number: string;
  holiday_residence: string | null;
  learning_expectations: string | null;
  preferred_placement: string | null;
  membership_status: MembershipStatus;
  membership_activated_at: string | null;
  payment_verified: boolean;
  last_payment_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string | null;
  attendance_open: boolean;
  semester_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Semester {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

export interface MemberProgression {
  id: string;
  member_id: string;
  semester_id: string;
  previous_year: number;
  next_year: number | null;
  previous_status: MembershipStatus;
  next_status: MembershipStatus;
  processed_by: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  meeting_id: string;
  status: "present";
  checked_in_at: string;
}

export interface Post {
  id: string;
  title: string;
  short_description: string | null;
  content: string;
  cover_image: string | null;
  author_id: string | null;
  author_name: string | null;
  post_type: PostType;
  category: string | null;
  published: boolean;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  is_featured: boolean;
  featured_order: number;
  uploaded_by: string | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_by: string | null;
  updated_at: string;
}

export interface LandingPageSettings {
  id: boolean;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image: string | null;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  intro_heading: string;
  intro_content: string;
  intro_image: string | null;
  intro_image_alt: string;
  about_heading: string;
  about_content: string;
  about_image: string | null;
  about_image_alt: string;
  footer_description: string;
  footer_address: string;
  footer_email: string;
  footer_phone_1: string | null;
  footer_phone_2: string | null;
  footer_instagram_url: string | null;
  footer_tiktok_url: string | null;
  footer_copyright: string;
  show_announcement: boolean;
  show_intro: boolean;
  show_meeting: boolean;
  show_stories: boolean;
  show_updates: boolean;
  show_gallery: boolean;
  seo_title: string;
  seo_description: string;
  social_image: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminRoleRow {
  id: string;
  user_id: string;
  role: AdminRoleName;
  granted_by: string | null;
  created_at: string;
}

// Minimal Supabase-generated-style Database type.
// If you later run `supabase gen types typescript`, replace this file with
// the generated one. The shapes above match it.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] };
      semesters: { Row: Semester; Insert: Partial<Semester>; Update: Partial<Semester>; Relationships: [] };
      member_progressions: { Row: MemberProgression; Insert: Partial<MemberProgression>; Update: Partial<MemberProgression>; Relationships: [] };
      meetings: { Row: Meeting; Insert: Partial<Meeting>; Update: Partial<Meeting>; Relationships: [] };
      attendance: {
        Row: AttendanceRecord;
        Insert: Partial<AttendanceRecord>;
        Update: Partial<AttendanceRecord>;
        Relationships: [
          {
            foreignKeyName: "attendance_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post>; Relationships: [] };
      gallery: { Row: GalleryImage; Insert: Partial<GalleryImage>; Update: Partial<GalleryImage>; Relationships: [] };
      site_settings: { Row: SiteSetting; Insert: Partial<SiteSetting>; Update: Partial<SiteSetting>; Relationships: [] };
      landing_page_settings: { Row: LandingPageSettings; Insert: Partial<LandingPageSettings>; Update: Partial<LandingPageSettings>; Relationships: [] };
      admin_roles: { Row: AdminRoleRow; Insert: Partial<AdminRoleRow>; Update: Partial<AdminRoleRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      membership_status: MembershipStatus;
      member_sex: MemberSex;
      post_type: PostType;
      admin_role: AdminRoleName;
      attendance_status: "present";
    };
    CompositeTypes: Record<string, never>;
  };
}
