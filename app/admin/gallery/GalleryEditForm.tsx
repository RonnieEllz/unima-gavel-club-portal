"use client";

import { useRef, useState, useTransition } from "react";
import { updateGalleryImage } from "@/lib/actions/admin";

export default function GalleryEditForm({
  id,
  caption,
  category,
  isFeatured,
  featuredOrder,
}: {
  id: string;
  caption: string | null;
  category: string | null;
  isFeatured: boolean;
  featuredOrder: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} className="mt-2 text-xs text-gray-500">
      <summary className="cursor-pointer text-maroon-700 hover:underline">Edit details</summary>
      <form
        className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setSaved(false);
          const form = new FormData(event.currentTarget);
          startTransition(async () => {
            const result = await updateGalleryImage(
            id,
            String(form.get("caption") ?? ""),
            String(form.get("category") ?? ""),
            form.get("is_featured") === "on",
            Number(form.get("featured_order") ?? 0)
          );
            if (result.error) setError(result.error);
            else {
              setSaved(true);
              detailsRef.current?.removeAttribute("open");
            }
          });
        }}
      >
        <input name="caption" defaultValue={caption ?? ""} maxLength={500} className="input-field" aria-label="Photo caption" placeholder="Caption" />
        <input name="category" defaultValue={category ?? ""} maxLength={100} className="input-field" aria-label="Photo category" placeholder="Category" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="is_featured" defaultChecked={isFeatured} /> Feature on the landing page
        </label>
        <input name="featured_order" type="number" min="0" max="10000" defaultValue={featuredOrder} className="input-field" aria-label="Featured order" />
        <button disabled={isPending} className="btn-secondary !px-3 !py-1 text-xs">{isPending ? "Saving..." : "Save"}</button>
        {saved && <p className="text-green-700">Saved.</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </details>
  );
}
