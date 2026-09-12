import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/attendance", label: "Attendance" },
  { href: "/dashboard/meetings", label: "Meetings" },
  { href: "/updates", label: "Updates" },
  { href: "/stories", label: "Stories" },
];

export default function MemberNavbar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container-page flex h-16 flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="font-display text-lg font-bold text-maroon-800">
          UNIMA Gavel Club
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-maroon-700">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-semibold text-gold-600 hover:text-gold-700">
              Admin Dashboard
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-gray-500 hover:text-red-600">
              Log Out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
