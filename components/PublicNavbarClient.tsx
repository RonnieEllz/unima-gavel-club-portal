"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/stories", label: "Stories" },
  { href: "/updates", label: "Updates" },
];

export default function PublicNavbarClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const user = session?.user ?? null;
      setIsLoggedIn(!!user);
      setIsReady(true);
      if (user) {
        const { data: role } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();
        if (active) setIsAdmin(!!role);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsLoggedIn(!!session?.user);
        if (!session?.user) setIsAdmin(false);
        setIsReady(true);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-maroon-900/10 bg-white/90 backdrop-blur">
      <nav className="container-page relative flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-maroon-800">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black">
            <Image src="/logo.jpg" alt="UNIMA Gavel Club logo" width={40} height={40} className="h-full w-full object-cover object-center" priority />
          </span>
          UNIMA Gavel Club
        </Link>
        <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-16 flex-col gap-4 border-b border-maroon-900/10 bg-white p-4 shadow-md md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-maroon-700">
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto mr-2 rounded-md p-2 text-xl text-maroon-800 hover:bg-maroon-50 md:hidden"
        >
          {menuOpen ? "×" : "☰"}
        </button>
        <div className="flex items-center gap-3">
          {!isReady ? (
            <span className="h-5 w-20 animate-pulse rounded bg-gray-100" aria-label="Loading account navigation" />
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-maroon-700 hover:underline">
                Home
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hidden text-sm font-semibold text-gold-700 hover:underline sm:inline">
                  Admin
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="text-sm font-semibold text-gray-600 hover:text-red-600">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-semibold text-maroon-700 hover:underline sm:inline">
                Member Login
              </Link>
              <Link href="/join" className="btn-primary !px-4 !py-2 text-sm">
                Join the Club
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
