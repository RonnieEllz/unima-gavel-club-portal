"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type EasterEggLogoProps = {
  size: 40 | 48;
  className: string;
  priority?: boolean;
};

export default function EasterEggLogo({ size, className, priority = false }: EasterEggLogoProps) {
  const [clicks, setClicks] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  function handleClick() {
    setClicks((currentClicks) => {
      const nextClicks = currentClicks + 1;
      if (nextClicks >= 12) {
        setIsOpen(true);
        return 0;
      }
      return nextClicks;
    });
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className} aria-label="UNIMA Gavel Club logo">
        <Image src="/logo.jpg" alt="" width={size} height={size} className="h-full w-full scale-[1.14] object-cover object-center" priority={priority} />
      </button>
      {isMounted && isOpen && createPortal(
        <div className="footer-easter-egg" role="dialog" aria-modal="true" aria-labelledby="footer-easter-egg-title">
          <div className="footer-easter-egg-confetti" aria-hidden="true">✦ ✧ ★ ✦ ✧</div>
          <div className="footer-easter-egg-content">
            <button type="button" onClick={() => setIsOpen(false)} className="footer-easter-egg-close" aria-label="Close celebration">
              ×
            </button>
            <Image src="/logo.jpg" alt="" width={96} height={96} className="mx-auto h-24 w-24 rounded-full object-cover" />
            <p id="footer-easter-egg-title" className="mt-6 font-display text-3xl font-bold text-gold-300 sm:text-5xl">
              UNIMA Toastmasters,
            </p>
            <p className="mt-2 text-2xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
              where LEADERS ARE MADE!!!
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
