"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addGalleryImage } from "@/lib/actions/admin";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default function UploadForm({ fixedCategory, captionLabel = "Caption" }: { fixedCategory?: string; captionLabel?: string } = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const featuredRef = useRef<HTMLInputElement>(null);
  const featuredOrderRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a photo to upload.");
      return;
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setError("Use a JPG, PNG, WEBP, or GIF image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Photos must be 10 MB or smaller.");
      return;
    }

    setIsUploading(true);
    let uploadedPath: string | null = null;
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;
      uploadedPath = path;

      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(path);

      const result = await addGalleryImage(
        publicUrlData.publicUrl,
        captionRef.current?.value ?? "",
        categoryRef.current?.value ?? "",
        featuredRef.current?.checked ?? false,
        Number(featuredOrderRef.current?.value ?? 0)
      );
      if (result?.error) throw new Error(result.error);

      if (fileRef.current) fileRef.current.value = "";
      if (captionRef.current) captionRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = fixedCategory ?? "";
      if (featuredRef.current) featuredRef.current.checked = false;
      if (featuredOrderRef.current) featuredOrderRef.current.value = "0";
      router.refresh();
    } catch (err: any) {
      if (uploadedPath) {
        const supabase = createClient();
        await supabase.storage.from("gallery").remove([uploadedPath]);
      }
      setError(err.message ?? "Upload failed. Make sure the 'gallery' storage bucket exists.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="card mt-6 grid gap-4 p-6 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <label className="label-field">Photo</label>
        <input ref={fileRef} type="file" accept="image/*" required className="input-field" />
      </div>
      <div>
        <label className="label-field">{captionLabel}</label>
        <input ref={captionRef} className="input-field" />
      </div>
      {fixedCategory ? (
        <input ref={categoryRef} type="hidden" defaultValue={fixedCategory} />
      ) : (
        <div>
          <label className="label-field">Category</label>
          <input ref={categoryRef} placeholder="e.g. Meetings, Events" className="input-field" />
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input ref={featuredRef} type="checkbox" /> Feature on the landing page
      </label>
      <div>
        <label className="label-field" htmlFor="gallery_featured_order">Featured order</label>
        <input ref={featuredOrderRef} id="gallery_featured_order" type="number" min="0" max="10000" defaultValue="0" className="input-field" />
      </div>
      <div className="flex items-end">
        <button disabled={isUploading} className="btn-primary w-full">
          {isUploading ? "Uploading…" : "Upload Photo"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
    </form>
  );
}
