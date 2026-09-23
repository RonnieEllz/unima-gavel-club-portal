"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function LoadingEasterEgg() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="navigation-logo-pulse cursor-pointer border-0 p-0 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-4"
        aria-label="Open loading Easter egg"
      >
        <img src="/logo.jpg" alt="Loading" className="navigation-logo" />
      </button>
      {isMounted && isOpen && createPortal(
        <div className="footer-easter-egg" role="dialog" aria-modal="true" aria-labelledby="loading-easter-egg-title">
          <div className="footer-easter-egg-confetti" aria-hidden="true">✦ ✧ ★ ✦ ✧</div>
          <div className="footer-easter-egg-content about-easter-egg-content">
            <button type="button" onClick={() => setIsOpen(false)} className="footer-easter-egg-close" aria-label="Close celebration">
              ×
            </button>
            <p id="loading-easter-egg-title" className="text-left text-base leading-relaxed text-white sm:text-lg">
              If you found this, then you have found what you were looking for. Say Aye!!! Go click on the feed Toastmasters logo for another Easter egg. This is the only one I will provide a clue, the rest, YOU ARE A TOASTMASTER!!! Figure it out. Click it the number of letters Toastmaster has. Amen
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
