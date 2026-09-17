"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  program: z.string().min(2, "Please enter your program of study"),
  year_of_study: z.coerce.number().min(1).max(6),
  sex: z.enum(["male", "female"]),
  phone_number: z.string().min(7, "Please enter a valid phone number"),
  holiday_residence: z.string().optional(),
  learning_expectations: z.string().optional(),
  preferred_placement: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function registerMember(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, password, ...profileFields } = parsed.data;
  const supabase = createClient();

  // Supabase Auth hashes and stores the password securely. The app never
  // sees or stores a plaintext or custom-hashed password itself.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: profileFields, // consumed by the handle_new_user() trigger
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export type LoginFormState = { error?: string };

function getSafeRedirectPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }

  return value;
}

export async function loginMember(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirectPath(String(formData.get("next") ?? "/dashboard"));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password. Please try again." };
  }

  redirect(next);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
