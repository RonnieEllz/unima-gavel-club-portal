import { createClient } from "@/lib/supabase/server";
import type { GalleryImage } from "@/types/database";
import UploadForm from "./UploadForm";
import GalleryItemActions from "./GalleryItemActions";
import { isSafeImageUrl } from "@/lib/validation";

export default async function AdminGalleryPage() {
  const supabase = createClient();
  const { data: imageData, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
  const images = imageData as GalleryImage[] | null;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Photo Gallery</h1>
      <p className="mt-1 text-gray-600">
        Upload real UNIMA Gavel Club photographs: meetings, trainings, events and special
        occasions. Set a photo category to <span className="font-semibold">executive</span> to show it in the public executive members section.
      </p>

      <UploadForm />

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">Photos could not be loaded.</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images && images.length > 0 ? images.map((img) => (
          <div key={img.id} className="card overflow-hidden">
            <div className="relative aspect-square bg-maroon-100">
              {isSafeImageUrl(img.image_url) ? (
                <img src={img.image_url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center text-xs text-red-600">
                  Invalid image URL
                </div>
              )}
            </div>
            <div className="p-2">
              {img.caption && <p className="truncate text-xs text-gray-600">{img.caption}</p>}
              <GalleryItemActions id={img.id} caption={img.caption} category={img.category} isFeatured={img.is_featured} featuredOrder={img.featured_order} />
            </div>
          </div>
        )) : <p className="text-gray-500">No photos uploaded yet.</p>}
      </div>
    </div>
  );
}
