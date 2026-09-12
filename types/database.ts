export type MembershipStatus = "pending" | "active" | "inactive" | "rejected";
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
  created_by: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
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
