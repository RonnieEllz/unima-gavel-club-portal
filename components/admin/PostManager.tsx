import type { Post, PostType } from "@/types/database";
import PostRowActions from "./PostRowActions";
import PostForm from "./PostForm";
import Link from "next/link";

export default function PostManager({
  posts,
  postType,
  loadError = false,
  filters,
}: {
  posts: Post[];
  postType: PostType;
  loadError?: boolean;
  filters: { q: string; status: string; category: string; page: number; totalPages: number };
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">
        {postType === "story" ? "Stories" : "Updates"}
      </h1>

      <PostForm postType={postType} />

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4">
        <input name="q" defaultValue={filters.q} placeholder="Search title, author, category..." className="input-field min-w-[16rem] flex-1" />
        <input name="category" defaultValue={filters.category} placeholder="Category" className="input-field max-w-[12rem]" />
        <select name="status" defaultValue={filters.status} className="input-field max-w-[10rem]">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="btn-secondary !px-4 !py-2 text-sm">Filter</button>
        <Link href={`/admin/${postType === "story" ? "stories" : "updates"}`} className="btn-secondary !px-4 !py-2 text-sm">Clear</Link>
      </form>

      {loadError && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Posts could not be loaded. Please try again.
        </p>
      )}

      <div className="mt-8 space-y-3">
        {posts.length > 0 ? (
          posts.map((p) => (
            <div key={p.id} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-maroon-800">{p.title}</p>
                <p className="text-xs text-gray-400">
                  {p.author_name || "-"} · {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
                <PostRowActions post={p} postType={postType} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No {postType === "story" ? "stories" : "updates"} yet.</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Page {filters.page} of {filters.totalPages}</span>
        <div className="flex gap-2">
          {filters.page > 1 ? <Link href={pageUrl(postType, filters, filters.page - 1)} className="btn-secondary !px-4 !py-2">Previous</Link> : <span className="rounded-md border border-gray-200 px-4 py-2 text-gray-400">Previous</span>}
          {filters.page < filters.totalPages ? <Link href={pageUrl(postType, filters, filters.page + 1)} className="btn-secondary !px-4 !py-2">Next</Link> : <span className="rounded-md border border-gray-200 px-4 py-2 text-gray-400">Next</span>}
        </div>
      </div>
    </div>
  );
}

function pageUrl(postType: PostType, filters: { q: string; status: string; category: string }, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  return `/admin/${postType === "story" ? "stories" : "updates"}?${params.toString()}`;
}
