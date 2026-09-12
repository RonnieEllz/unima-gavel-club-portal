import { notFound } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { isSafeImageUrl } from "@/lib/validation";

export default async function StoryDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .eq("post_type", "story")
    .eq("published", true)
    .maybeSingle();

  if (!post) notFound();

  return (
    <>
      <PublicNavbar />
      <article className="container-page max-w-3xl py-16">
        {post.category && (
          <span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-ink-900">
            {post.category}
          </span>
        )}
        <h1 className="mt-4 font-display text-4xl font-bold text-maroon-800">{post.title}</h1>
        <p className="mt-2 text-sm text-gray-400">
          {post.author_name ?? "UNIMA Gavel Club"} ·{" "}
          {new Date(post.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {isSafeImageUrl(post.cover_image) && (
          <div className="relative mt-8 h-80 w-full overflow-hidden rounded-xl">
            <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="prose prose-maroon mt-8 max-w-none whitespace-pre-wrap text-gray-700">
          {post.content}
        </div>
      </article>
      <Footer />
    </>
  );
}
