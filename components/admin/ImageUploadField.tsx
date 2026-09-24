"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default function ImageUploadField({
  name,
  label,
  currentUrl,
  showUrlInput = false,
}: {
  name: string;
  label: string;
  currentUrl: string;
  showUrlInput?: boolean;
}) {
  const [imageUrl, setImageUrl] = useState(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      setError("Use a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Images must be 10 MB or smaller.");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `landing/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("gallery").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <label className="label-field" htmlFor={`${name}_file`}>{label}</label>
      <input type="hidden" name={name} value={imageUrl} />
      {showUrlInput && (
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Paste a secure image URL or upload a photo below"
          className="input-field"
        />
      )}
      <input
        id={`${name}_file`}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="input-field"
        onChange={(event) => void handleChange(event.target.files?.[0])}
      />
      {isUploading && <p className="text-xs text-gray-500">Uploading image...</p>}
      {imageUrl && !isUploading && (
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt="Current setting preview" className="h-16 w-24 rounded-md object-cover" />
          <button type="button" className="text-xs font-semibold text-red-600 hover:underline" onClick={() => setImageUrl("")}>Remove image</button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
