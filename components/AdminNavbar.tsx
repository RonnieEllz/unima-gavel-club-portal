import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/members", label: "Members", operations: true },
  { href: "/admin/meetings", label: "Meetings", operations: true },
  { href: "/admin/attendance", label: "Attendance", operations: true },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/reports", label: "Reports", operations: true },
  { href: "/admin/semesters", label: "Semesters", semesterManagement: true },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit History" },
  { href: "/admin/administrators", label: "Administrators", superAdmin: true },
];

export default function AdminNavbar({ role }: { role: string | null }) {
  const canManageOperations = role === "super_admin" || role === "administrator" || role === "operations_admin";
  const canManageSemesters = role === "super_admin" || role === "administrator";
  const isSuperAdmin = role === "super_admin";
  const canSeeGeneralAdminLinks = role !== "operations_admin";

  return (
    <header className="border-b border-gray-200 bg-ink-900">
      <nav className="container-page flex h-16 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-display text-lg font-bold text-white">
            Gavel Club Admin
          </Link>
          {role && (
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold capitalize text-ink-900">
              {role.replace("_", " ")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {links
            .filter((link) => {
              if (link.superAdmin) return isSuperAdmin;
              if (link.semesterManagement) return canManageSemesters;
              if (link.operations) return canManageOperations;
              return canSeeGeneralAdminLinks;
            })
            .map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-300 hover:text-white">
              {l.href === "/admin" && role === "operations_admin" ? "Operations Dashboard" : l.label}
            </Link>
            ))}
          <Link href="/dashboard" className="text-sm font-medium text-gold-400 hover:text-gold-300">
            Member View
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-gray-400 hover:text-red-400">
              Log Out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
