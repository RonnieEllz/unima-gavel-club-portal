"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGalleryImage } from "@/lib/actions/admin";
import GalleryEditForm from "./GalleryEditForm";

export default function GalleryItemActions({
  id,
  caption,
  category,
  isFeatured,
  featuredOrder,
  lockCategory = false,
  captionLabel = "Caption",
}: {
  id: string;
  caption: string | null;
  category: string | null;
  isFeatured: boolean;
  featuredOrder: number;
  lockCategory?: boolean;
  captionLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this photo?")) {
          startTransition(async () => {
            const result = await deleteGalleryImage(id);
            if (result.error) setError(result.error);
            else router.refresh();
          });
        }
      }}
      className="mt-1 text-xs font-semibold text-red-600 hover:underline"
    >
      Delete
    </button>
    {error && <p className="text-xs text-red-600">{error}</p>}
    <GalleryEditForm id={id} caption={caption} category={category} isFeatured={isFeatured} featuredOrder={featuredOrder} lockCategory={lockCategory} captionLabel={captionLabel} />
    </>
  );
}
