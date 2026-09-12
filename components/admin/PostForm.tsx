"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { createPost, type PostFormState } from "@/lib/actions/admin";
import type { PostType } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const initialState: PostFormState = {};

function SubmitButton({ noun, disabled = false }: { noun: string; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending || disabled} className="btn-primary disabled:opacity-60">
      {pending ? `Creating ${noun}…` : disabled ? "Finish cover upload…" : `Create ${noun}`}
    </button>
  );
}

export default function PostForm({ postType }: { postType: PostType }) {
  const [state, formAction] = useFormState(createPost.bind(null, postType), initialState);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const noun = postType === "story" ? "Story" : "Update";

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setCoverUrl("");
      setCoverError(null);
    }
  }, [state.success]);

  async function uploadCover(file: File) {
    setCoverError(null);
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setCoverError("Use a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setCoverError("Cover photos must be 10 MB or smaller.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("covers").upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    } catch (error) {
      setCoverError(error instanceof Error ? error.message : "Cover upload failed.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="card mt-6 grid gap-4 p-6">
      {state.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {noun} created successfully.
        </p>
      )}
      <div>
        <label className="label-field">Title</label>
        <input name="title" required className="input-field" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Author Name</label>
          <input name="author_name" className="input-field" placeholder="e.g. Club President" />
        </div>
        {postType === "story" && (
          <div>
            <label className="label-field">Category (optional)</label>
            <input name="category" className="input-field" placeholder="e.g. Leadership Lessons" />
          </div>
        )}
      </div>
      <div>
        <label className="label-field">Short Description</label>
        <input name="short_description" className="input-field" />
      </div>
      <div>
        <label className="label-field">Cover Photo</label>
        <input type="hidden" name="cover_image" value={coverUrl} />
        <input
          ref={coverFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="input-field"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadCover(file);
          }}
        />
        {isUploadingCover && <p className="mt-1 text-xs text-gray-500">Uploading cover photo…</p>}
        {coverUrl && !isUploadingCover && <p className="mt-1 text-xs text-green-700">Cover photo ready.</p>}
        {coverError && <p className="mt-1 text-xs text-red-600">{coverError}</p>}
      </div>
      <div>
        <label className="label-field">Full Content</label>
        <textarea name="content" required rows={6} className="input-field" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="published" defaultChecked /> Publish immediately
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="is_featured" /> Feature on the landing page
      </label>
      <div>
        <label htmlFor="featured_order" className="label-field">Featured order</label>
        <input id="featured_order" type="number" name="featured_order" min="0" max="10000" defaultValue="0" className="input-field" />
        <p className="mt-1 text-xs text-gray-500">Lower numbers appear first among featured content.</p>
      </div>
      <div>
        <SubmitButton noun={noun} disabled={isUploadingCover} />
      </div>
    </form>
  );
}