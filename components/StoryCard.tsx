import Link from "next/link";
import type { Post } from "@/types/database";
import { isSafeImageUrl } from "@/lib/validation";

export default function StoryCard({ post }: { post: Post }) {
  return (
    <Link href={`/stories/${post.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-maroon-100">
        {isSafeImageUrl(post.cover_image) ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-maroon-300">
            <span className="text-sm">Photo coming soon</span>
          </div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-ink-900">
            {post.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-maroon-800 group-hover:underline">
          {post.title}
        </h3>
        {post.short_description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.short_description}</p>
        )}
        <p className="mt-3 text-xs font-medium text-gray-400">
          {post.author_name ?? "UNIMA Gavel Club"} · {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
