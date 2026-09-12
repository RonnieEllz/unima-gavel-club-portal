import { createClient } from "@/lib/supabase/server";
import PostManager from "@/components/admin/PostManager";
import type { Post } from "@/types/database";

export default async function AdminUpdatesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; category?: string; page?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q?.trim().slice(0, 100) ?? "";
  const status = searchParams.status === "published" || searchParams.status === "draft" ? searchParams.status : "";
  const category = searchParams.category?.trim().slice(0, 80) ?? "";
  const page = Math.min(Math.max(Number.parseInt(searchParams.page ?? "1", 10) || 1, 1), 1000);
  const query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("post_type", "update")
    .order("created_at", { ascending: false });
  if (q) query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%,author_name.ilike.%${q}%,category.ilike.%${q}%`);
  if (status) query.eq("published", status === "published");
  if (category) query.ilike("category", `%${category}%`);
  const { data: posts, error, count } = await query.range((page - 1) * 20, page * 20 - 1);

  return <PostManager posts={(posts as Post[]) ?? []} postType="update" loadError={!!error} filters={{ q, status, category, page, totalPages: Math.max(1, Math.ceil((count ?? 0) / 20)) }} />;
}
