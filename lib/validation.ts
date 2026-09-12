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
});

export const postTypeSchema = z.enum(["story", "update"]);
export const adminRoleSchema = z.enum(["super_admin", "administrator", "operations_admin", "content_administrator"]);

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