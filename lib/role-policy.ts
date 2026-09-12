import type { AdminRoleName } from "@/types/database";

export function canManageOperations(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator" || role === "operations_admin";
}

export function hasContentAccess(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator" || role === "content_administrator";
}

export function isSuperAdmin(role: AdminRoleName | null) {
  return role === "super_admin";
}

export function canAccessAdminPath(role: AdminRoleName | null, pathname: string) {
  if (!role) return false;
  if (pathname === "/admin" || pathname === "/admin/") return true;
  if (pathname.startsWith("/admin/administrators")) return isSuperAdmin(role);
  if (
    pathname.startsWith("/admin/members") ||
    pathname.startsWith("/admin/meetings") ||
    pathname.startsWith("/admin/attendance") ||
    pathname.startsWith("/admin/reports")
  ) {
    return canManageOperations(role);
  }
  if (role === "operations_admin") return false;
  return hasContentAccess(role);
}
