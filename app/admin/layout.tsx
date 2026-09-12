import { redirect } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { getCurrentUserProfile } from "@/lib/data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, adminRole } = await getCurrentUserProfile();

  // Belt-and-braces: middleware already redirects non-admins away from
  // /admin/*, but Postgres RLS (is_admin()) is the real boundary. Every
  // query below will independently fail for a non-admin regardless of
  // this check.
  if (!user) redirect("/login");
  if (!isAdmin) redirect("/dashboard?error=not_admin");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar role={adminRole} />
      <main className="container-page py-10">{children}</main>
    </div>
  );
}
