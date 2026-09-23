import Image from "next/image";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { getCurrentUserProfile } from "@/lib/data";

const links = [
  { href: "/", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/stories", label: "Stories" },
  { href: "/updates", label: "Updates" },
];

export default async function PublicNavbar() {
  const { user, isAdmin } = await getCurrentUserProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-maroon-900/10 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-maroon-800">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black">
            <Image src="/logo.jpg" alt="UNIMA Gavel Club logo" width={40} height={40} className="h-full w-full object-cover object-center" priority />
          </span>
          UNIMA Gavel Club
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-maroon-700">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-maroon-700 hover:underline">
                Home
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hidden text-sm font-semibold text-gold-700 hover:underline sm:inline">
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="text-sm font-semibold text-gray-600 hover:text-red-600">
                  Log Out
                </button>
              </form>
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
