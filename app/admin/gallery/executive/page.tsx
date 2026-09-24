import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { GalleryImage } from "@/types/database";
import { isSafeImageUrl } from "@/lib/validation";
import UploadForm from "../UploadForm";
import GalleryItemActions from "../GalleryItemActions";

export default async function ExecutiveGalleryPage() {
  const supabase = createClient();
  const { data: imageData, error } = await supabase
    .from("gallery")
    .select("*")
    .ilike("category", "executive")
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: true });
  const images = imageData as GalleryImage[] | null;

  return (
    <div>
      <Link href="/admin/gallery" className="text-sm font-semibold text-maroon-700 hover:underline">
        Back to Photo Gallery
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold text-maroon-800">Club Leadership</h1>
      <p className="mt-1 text-gray-600">
        Upload and manage the executive member portraits shown below the public gallery.
      </p>

      <UploadForm fixedCategory="executive" captionLabel="Position" />

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">Leadership photos could not be loaded.</p>}

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {images && images.length > 0 ? images.map((img) => (
          <div key={img.id} className="card overflow-hidden">
            <div className="relative aspect-square rounded-full bg-maroon-100 p-1">
              <div className="h-full w-full overflow-hidden rounded-full">
                {isSafeImageUrl(img.image_url) ? (
                  <img src={img.image_url} alt={img.caption ?? "Executive member"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-3 text-center text-xs text-red-600">Invalid image URL</div>
                )}
              </div>
            </div>
            <div className="p-2">
              {img.caption && <p className="truncate text-xs text-gray-600">{img.caption}</p>}
              <GalleryItemActions
                id={img.id}
                caption={img.caption}
                category={img.category}
                isFeatured={img.is_featured}
                featuredOrder={img.featured_order}
                lockCategory
                captionLabel="Position"
              />
            </div>
          </div>
        )) : <p className="text-gray-500">No leadership photos uploaded yet.</p>}
      </div>
    </div>
  );
}
