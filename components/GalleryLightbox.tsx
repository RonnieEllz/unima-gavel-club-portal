"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
};

export default function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-square w-full overflow-hidden rounded-lg border-0 bg-maroon-100 p-0 text-left focus:outline-none focus:ring-2 focus:ring-maroon-500"
            aria-label={image.caption ?? "Open gallery photo"}
          >
            <Image
              src={image.image_url}
              alt={image.caption ?? "Gavel Club photo"}
              fill
              className="object-cover transition duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative aspect-square w-[95vw] max-w-[min(80vw,80vh)] overflow-hidden rounded-2xl bg-white/5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 sm:right-3 sm:top-3 sm:text-sm"
            >
              Close
            </button>
            <div className="relative h-full w-full">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.caption ?? "Expanded Gavel Club photo"}
                fill
                className="object-contain p-2 sm:p-3"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
