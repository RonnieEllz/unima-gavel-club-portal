"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGalleryImage } from "@/lib/actions/admin";
import GalleryEditForm from "./GalleryEditForm";

export default function GalleryItemActions({
  id,
  caption,
  name,
  category,
  isFeatured,
  featuredOrder,
  lockCategory = false,
  captionLabel = "Caption",
}: {
  id: string;
  caption: string | null;
  name?: string | null;
  category: string | null;
  isFeatured: boolean;
  featuredOrder: number;
  lockCategory?: boolean;
  captionLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteGalleryImage(id);
      if (result.error) {
        setError(result.error);
      } else {
        setShowDeleteDialog(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          setShowDeleteDialog(true);
        }}
        className="mt-1 text-xs font-semibold text-red-600 hover:underline"
      >
        Delete
      </button>
      {error && !showDeleteDialog && <p role="alert" className="text-xs text-red-600">{error}</p>}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby={`delete-gallery-title-${id}`} aria-describedby={`delete-gallery-description-${id}`}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id={`delete-gallery-title-${id}`} className="font-display text-xl font-bold text-maroon-800">Delete this photo?</h2>
            <p id={`delete-gallery-description-${id}`} className="mt-2 text-sm text-gray-600">This will permanently remove the photo from the gallery.</p>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDeleteDialog(false)} disabled={isPending} className="btn-secondary disabled:opacity-60">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={isPending} className="btn-primary bg-red-700 hover:bg-red-800 disabled:opacity-60">
                {isPending ? "Deleting..." : "Delete photo"}
              </button>
            </div>
          </div>
        </div>
      )}
      <GalleryEditForm id={id} caption={caption} name={name} category={category} isFeatured={isFeatured} featuredOrder={featuredOrder} lockCategory={lockCategory} captionLabel={captionLabel} />
    </>
  );
}
