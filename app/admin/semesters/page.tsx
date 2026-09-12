import { createClient } from "@/lib/supabase/server";
import SemesterManager from "./SemesterManager";
import type { Semester } from "@/types/database";

export default async function AdminSemestersPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("id, name, starts_on, ends_on, is_active, completed_at, completed_by, created_at")
    .order("starts_on", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Semesters</h1>
      <p className="mt-1 text-gray-600">Configure the period used for operational attendance status.</p>
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load semesters: {error.message}
        </p>
      )}
      <SemesterManager semesters={(data as Semester[]) ?? []} />
    </div>
  );
}