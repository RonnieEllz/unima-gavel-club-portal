import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";
import AdministratorsForm from "./AdministratorsForm";
import RemoveAdminButton from "./RemoveAdminButton";

const rolePermissions: Record<string, string> = {
  super_admin: "Everything, including administrators, settings, audit, operations, and content",
  administrator: "Members, meetings, attendance, reports, exports, settings, audit, and content",
  operations_admin: "Members, meetings, attendance, reports, and exports",
  content_administrator: "Stories, updates, gallery, and content management",
};

export default async function AdministratorsPage() {
  const supabase = createClient();
  const { adminRole } = await getCurrentUserProfile();
  const isSuperAdmin = adminRole === "super_admin";

  const { data: adminRows, error: adminsError } = await supabase
    .from("admin_roles")
    .select("id, user_id, role, created_at")
    .order("created_at", { ascending: true });

  const adminUserIds = (adminRows ?? []).map((admin) => admin.user_id);
  const { data: adminProfiles, error: profilesError } = adminUserIds.length
    ? await supabase.from("profiles").select("id, full_name, program").in("id", adminUserIds)
    : { data: [], error: null };
  const profilesById = new Map((adminProfiles ?? []).map((profile) => [profile.id, profile]));

  const { data: activeMembers } = await supabase
    .from("profiles")
    .select("id, full_name, program")
    .eq("membership_status", "active")
    .order("full_name");

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Administrators</h1>
      <p className="mt-1 text-gray-600">
        Manage who has administrator access. Only Super Admins can make changes here.
      </p>

      {!isSuperAdmin && (
        <p className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          You can view this list, but only a Super Admin can add, remove, or change roles.
        </p>
      )}

      {(adminsError || profilesError) && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Administrator records could not be loaded. Check that the administrator roster policies are applied in Supabase.
        </p>
      )}

      {isSuperAdmin && <AdministratorsForm members={activeMembers ?? []} />}

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Rights</th>
              <th className="px-4 py-3 font-semibold">Since</th>
              {isSuperAdmin && <th className="px-4 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adminRows && adminRows.length > 0 ? (
              adminRows.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {profilesById.get(a.user_id)?.full_name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{a.role.replace("_", " ")}</td>
                  <td className="max-w-md px-4 py-3 text-gray-600">{rolePermissions[a.role] ?? "No permissions defined"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3">
                      <RemoveAdminButton userId={a.user_id} />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No administrators yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
