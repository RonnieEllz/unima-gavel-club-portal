import type { Post } from "@/types/database";

export default function UpdateCard({ post }: { post: Post }) {
  return (
    <div className="card flex gap-4 p-5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-maroon-700 text-sm font-bold text-gold-400">
        {new Date(post.created_at).toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
      </div>
      <div>
        <h4 className="font-semibold text-maroon-800">{post.title}</h4>
        {post.short_description && (
          <p className="mt-1 text-sm text-gray-600">{post.short_description}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
