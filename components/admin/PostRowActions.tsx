"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePublished, deletePost } from "@/lib/actions/admin";
import type { PostType } from "@/types/database";
import PostEditForm from "./PostEditForm";
import type { Post } from "@/types/database";

export default function PostRowActions({
  post,
  postType,
}: {
  post: Post;
  postType: PostType;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await togglePublished(post.id, !post.published, postType);
            if (result.error) setError(result.error);
            else router.refresh();
          })
        }
        className="text-xs font-semibold text-maroon-700 hover:underline"
      >
        {post.published ? "Unpublish" : "Publish"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this post permanently?")) {
            startTransition(async () => {
              const result = await deletePost(post.id, postType);
              if (result.error) setError(result.error);
              else router.refresh();
            });
          }
        }}
        className="text-xs font-semibold text-red-600 hover:underline"
      >
        Delete
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <PostEditForm post={post} postType={postType} />
    </div>
  );
}
