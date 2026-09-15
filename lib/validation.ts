import { z } from "zod";

export function isSafeImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export const uuidSchema = z.string().uuid("Invalid identifier.");

export const meetingSchema = z.object({
  title: z.string().trim().min(2).max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid meeting date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Enter a valid meeting time."),
  venue: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000),
});

export const postSchema = z.object({
  title: z.string().trim().min(2).max(200),
  short_description: z.string().trim().max(500),
  content: z.string().trim().min(2).max(50000),
  cover_image: z
    .string()
    .trim()
    .refine((value) => value === "" || isSafeImageUrl(value), "Upload a supported cover photo.")
    .or(z.literal("")),
  category: z.string().trim().max(100),
  author_name: z.string().trim().max(160),
  is_featured: z.boolean(),
  featured_order: z.coerce.number().int().min(0).max(10000),
});

export const postTypeSchema = z.enum(["story", "update"]);
export const adminRoleSchema = z.enum(["super_admin", "administrator", "operations_admin", "content_administrator"]);

const optionalImageSchema = z.string().trim().refine((value) => value === "" || isSafeImageUrl(value), "Use a secure image URL.");

export const landingPageSettingsSchema = z.object({
  hero_eyebrow: z.string().trim().min(2).max(100),
  hero_title: z.string().trim().min(2).max(160),
  hero_description: z.string().trim().min(2).max(500),
  hero_image: optionalImageSchema,
  intro_heading: z.string().trim().min(2).max(120),
  intro_content: z.string().trim().min(2).max(3000),
  intro_image: optionalImageSchema,
  intro_image_alt: z.string().trim().min(2).max(200),
  about_heading: z.string().trim().min(2).max(160),
  about_content: z.string().trim().min(2).max(5000),
  about_image: optionalImageSchema,
  about_image_alt: z.string().trim().min(2).max(200),
  footer_description: z.string().trim().min(2).max(500),
  footer_address: z.string().trim().min(2).max(240),
  footer_email: z.string().trim().email().max(240),
  footer_phone_1: z.string().trim().max(40),
  footer_phone_2: z.string().trim().max(40),
  footer_copyright: z.string().trim().min(2).max(240),
  show_announcement: z.boolean(),
  show_intro: z.boolean(),
  show_meeting: z.boolean(),
  show_stories: z.boolean(),
  show_updates: z.boolean(),
  show_gallery: z.boolean(),
  seo_title: z.string().trim().min(2).max(160),
  seo_description: z.string().trim().min(2).max(320),
  social_image: optionalImageSchema,
});

export const landingPageContentSchema = landingPageSettingsSchema.pick({
  hero_eyebrow: true,
  hero_title: true,
  hero_description: true,
  hero_image: true,
  intro_heading: true,
  intro_content: true,
  intro_image: true,
  intro_image_alt: true,
  show_announcement: true,
  show_intro: true,
  show_meeting: true,
  show_stories: true,
  show_updates: true,
  show_gallery: true,
  seo_title: true,
  seo_description: true,
  social_image: true,
});

export const aboutPageSettingsSchema = landingPageSettingsSchema.pick({
  about_heading: true,
  about_content: true,
  about_image: true,
  about_image_alt: true,
});

export const footerSettingsSchema = landingPageSettingsSchema.pick({
  footer_description: true,
  footer_address: true,
  footer_email: true,
  footer_phone_1: true,
  footer_phone_2: true,
  footer_copyright: true,
});

export const memberDetailsSchema = z.object({
  full_name: z.string().trim().min(2).max(160),
  program: z.string().trim().min(2).max(160),
  year_of_study: z.coerce.number().int().min(1).max(6),
  sex: z.enum(["male", "female"]),
  phone_number: z.string().trim().min(7).max(40),
  holiday_residence: z.string().trim().max(500),
  learning_expectations: z.string().trim().max(5000),
  preferred_placement: z.string().trim().max(5000),
});

export const semesterSchema = z.object({
  name: z.string().trim().min(2).max(160),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid start date."),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid end date."),
}).refine((value) => value.ends_on >= value.starts_on, {
  message: "The end date must be on or after the start date.",
  path: ["ends_on"],
});