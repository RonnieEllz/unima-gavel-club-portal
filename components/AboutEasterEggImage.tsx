"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type AboutEasterEggImageProps = {
  src: string;
  alt: string;
};

export default function AboutEasterEggImage({ src, alt }: AboutEasterEggImageProps) {
  const [clicks, setClicks] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  function handleImageClick() {
    setClicks((currentClicks) => {
      const nextClicks = currentClicks + 1;
      if (nextClicks >= 6) {
        setIsOpen(true);
        return 0;
      }
      return nextClicks;
    });
  }

  return (
    <>
      <button type="button" onClick={handleImageClick} className="absolute inset-0 h-full w-full cursor-pointer" aria-label={alt}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </button>
      {isMounted && isOpen && createPortal(
        <div className="footer-easter-egg" role="dialog" aria-modal="true" aria-labelledby="about-easter-egg-title">
          <div className="footer-easter-egg-confetti" aria-hidden="true">✦ ✧ ★ ✦ ✧</div>
          <div className="footer-easter-egg-content about-easter-egg-content max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setIsOpen(false)} className="footer-easter-egg-close" aria-label="Close celebration">
              ×
            </button>
            <p id="about-easter-egg-title" className="text-left text-base leading-relaxed text-white sm:text-lg">
              Toastmaster UNIMA found Ronald Longwe in 2024 or 2023, I cant remember, became the VPPR in 2025 and graduated in 2026. He build this as part of his LEGACY after he left UNIMA just because. With everything that happened, Nothing Happened. and therefore went to look for other THINGS Mate, Many Things. Also he was still terrified to speaking in public, lol even thou it was all about PUBLIC SPEAKING. Shout out to Riri(Oriana), Chizard(Chisomo), Nat(Natalie) and Kero(Lusekero), these toastmasters made this tenure fun.
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
