import type { AdminRoleName, MembershipStatus } from "@/types/database";

export function isOrdinaryMemberStatus(status: MembershipStatus | null | undefined) {
  return status === "pending" || status === "active" || status === "inactive" || status === "rejected" || status === "alumni";
}

export function canAccessMemberProfile(status: MembershipStatus | null | undefined) {
  return isOrdinaryMemberStatus(status);
}

export function canAccessMemberDashboard(status: MembershipStatus | null | undefined) {
  return isOrdinaryMemberStatus(status);
}

export function canAccessOperationalFeatures(status: MembershipStatus | null | undefined) {
  return status === "active";
}

export function isOperationalMemberRoute(pathname: string) {
  return pathname.startsWith("/dashboard/attendance") || pathname.startsWith("/dashboard/meetings");
}

export function canManageOperations(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator" || role === "operations_admin";
}

export function canManagePayments(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator" || role === "treasurer";
}

export function canManageSemesters(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator";
}

export function canManageSettings(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator";
}

export function canResetMemberPasswords(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator";
}

export function canViewAudit(role: AdminRoleName | null) {
  return role === "super_admin" || role === "administrator";
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
  if (pathname.startsWith("/admin/settings")) return canManageSettings(role);
  if (pathname.startsWith("/admin/payments")) return canManagePayments(role);
  if (pathname.startsWith("/admin/audit")) return canViewAudit(role);
  if (pathname.startsWith("/admin/semesters")) return canManageSemesters(role);
  if (
    pathname.startsWith("/admin/members") ||
    pathname.startsWith("/admin/meetings") ||
    pathname.startsWith("/admin/attendance") ||
    pathname.startsWith("/admin/reports")
  ) {
    return canManageOperations(role);
  }
  if (role === "operations_admin" || role === "treasurer") return false;
  return hasContentAccess(role);
}
