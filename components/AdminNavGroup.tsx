"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavLink = { href: string; label: string };

export default function AdminNavGroup({ label, links }: { label: string; links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!groupRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (links.length === 0) return null;

  return (
    <div ref={groupRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
      >
        {label}
        <span aria-hidden="true" className={`text-xs text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          v
        </span>
      </button>
      {isOpen && (
        <div role="menu" className="absolute left-0 top-full z-50 mt-2 min-w-44 rounded-md border border-white/10 bg-ink-900 p-2 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block rounded px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
