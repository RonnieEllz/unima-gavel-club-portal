import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import AdminNavGroup from "@/components/AdminNavGroup";

export default function AdminNavbar({ role }: { role: string | null }) {
  const canManageOperations = role === "super_admin" || role === "administrator" || role === "operations_admin";
  const canManageSemesters = role === "super_admin" || role === "administrator";
  const isSuperAdmin = role === "super_admin";
  const usesGroupedNavigation = isSuperAdmin || role === "administrator";
  const canSeeContentLinks = role === "super_admin" || role === "administrator" || role === "content_administrator";
  const canSeeSystemLinks = role === "super_admin" || role === "administrator";

  const contentLinks = canSeeContentLinks
    ? [
        { href: "/admin/updates", label: "Updates" },
        { href: "/admin/stories", label: "Stories" },
        { href: "/admin/gallery", label: "Gallery" },
      ]
    : [];
  const operationsLinks = canManageOperations
    ? [
        { href: "/admin/members", label: "Members" },
        { href: "/admin/meetings", label: "Meetings" },
        { href: "/admin/attendance", label: "Attendance" },
        { href: "/admin/reports", label: "Reports" },
        ...(canManageSemesters ? [{ href: "/admin/semesters", label: "Semesters" }] : []),
      ]
    : [];
  const systemLinks = canSeeSystemLinks
    ? [
        { href: "/admin/settings", label: "Settings" },
        { href: "/admin/audit", label: "Audit History" },
        ...(isSuperAdmin ? [{ href: "/admin/administrators", label: "Administrators" }] : []),
      ]
    : [];
  const flatLinks = role === "content_administrator" ? contentLinks : role === "operations_admin" ? operationsLinks : [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/95 shadow-md backdrop-blur">
      <nav className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin" className="font-display text-lg font-bold text-white">
            Gavel Club Admin
          </Link>
          {role && (
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold capitalize text-ink-900">
              {role.replace("_", " ")}
            </span>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-1 md:w-auto">
          <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
            {role === "operations_admin" ? "Operations Dashboard" : "Dashboard"}
          </Link>
          {usesGroupedNavigation ? (
            <>
              <AdminNavGroup label="Content" links={contentLinks} />
              <AdminNavGroup label="Operations" links={operationsLinks} />
              <AdminNavGroup label="System" links={systemLinks} />
            </>
          ) : (
            flatLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white">
                {link.label}
              </Link>
            ))
          )}
          <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" aria-hidden="true" />
          <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-gold-400 hover:bg-white/10 hover:text-gold-300">
            Member View
          </Link>
          <form action={logout} className="ml-auto sm:ml-0">
            <button type="submit" className="rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-red-400">
              Log Out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
