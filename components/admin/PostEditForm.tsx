"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updatePost, type PostFormState } from "@/lib/actions/admin";
import type { Post, PostType } from "@/types/database";

const initialState: PostFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving..." : "Save Changes"}</button>;
}

export default function PostEditForm({ post, postType }: { post: Post; postType: PostType }) {
  const [state, formAction] = useFormState(updatePost.bind(null, post.id, postType), initialState);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const noun = postType === "story" ? "story" : "update";

  useEffect(() => {
    if (state.success) detailsRef.current?.removeAttribute("open");
  }, [state.success]);

  return (
    <details ref={detailsRef} className="mt-2 text-xs text-gray-500">
      <summary className="cursor-pointer text-maroon-700 hover:underline">Edit</summary>
      <form action={formAction} className="mt-3 grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
        {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-red-700">{state.error}</p>}
        {state.success && <p className="rounded-md bg-green-50 px-3 py-2 text-green-700">{noun} updated.</p>}
        <input name="title" defaultValue={post.title} required className="input-field" aria-label="Post title" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="author_name" defaultValue={post.author_name ?? ""} className="input-field" aria-label="Author name" />
          <input name="category" defaultValue={post.category ?? ""} className="input-field" aria-label="Category" />
        </div>
        <input name="short_description" defaultValue={post.short_description ?? ""} className="input-field" aria-label="Short description" />
        <input name="cover_image" defaultValue={post.cover_image ?? ""} className="input-field" aria-label="Cover image URL" />
        <textarea name="content" defaultValue={post.content} required rows={7} className="input-field" aria-label="Post content" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="published" defaultChecked={post.published} /> Published
        </label>
        <div><SubmitButton /></div>
      </form>
    </details>
  );
}
