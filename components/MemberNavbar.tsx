"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/lib/actions/auth";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/attendance", label: "Attendance" },
  { href: "/dashboard/meetings", label: "Meetings" },
  { href: "/about", label: "About" },
  { href: "/updates", label: "Updates" },
  { href: "/stories", label: "Stories" },
];

export default function MemberNavbar({ isAdmin, unreadCount }: { isAdmin: boolean; unreadCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="container-page relative flex min-h-16 items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" onClick={closeMenu} className="font-display text-lg font-bold text-maroon-800">
            UNIMA Gavel Club
          </Link>
          {unreadCount > 0 && (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-maroon-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Close member navigation menu" : "Open member navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md p-2 text-xl text-maroon-800 hover:bg-maroon-50 focus:outline-none focus:ring-2 focus:ring-maroon-700 md:hidden"
        >
          {menuOpen ? "×" : "☰"}
        </button>
        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-t border-gray-200 bg-white p-4 shadow-md md:static md:flex md:flex-row md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-maroon-50 hover:text-maroon-700 md:px-0 md:py-1 md:hover:bg-transparent">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={closeMenu} className="rounded-md px-3 py-2 text-sm font-semibold text-gold-600 hover:bg-maroon-50 hover:text-gold-700 md:px-0 md:py-1 md:hover:bg-transparent">
              Admin Dashboard
            </Link>
          )}
          <form action={logout} className="border-t border-gray-100 pt-1 md:border-0 md:pt-0">
            <button type="submit" onClick={closeMenu} className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 md:w-auto md:px-0 md:py-1 md:text-left md:hover:bg-transparent">
              Log Out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
