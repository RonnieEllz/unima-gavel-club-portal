import { createClient } from "@/lib/supabase/server";
import { updateSiteAnnouncement } from "@/lib/actions/admin";
import { normalizeAnnouncementInput } from "@/lib/announcement";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "announcement_text")
    .maybeSingle();

  const submitAnnouncement = async (formData: FormData) => {
    "use server";
    const raw = String(formData.get("announcement") ?? "");
    const normalized = normalizeAnnouncementInput(raw);
    if (!normalized.valid) {
      throw new Error("Announcement must be 1-500 characters long.");
    }
    await updateSiteAnnouncement(normalized.text);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Site Settings</h1>
      <p className="mt-2 text-gray-600">
        Update the banner announcement shown to visitors on the landing page.
      </p>

      <form action={submitAnnouncement} className="card mt-6 grid gap-4 p-6">
        <div>
          <label htmlFor="announcement" className="label-field">
            Landing page announcement
          </label>
          <textarea
            id="announcement"
            name="announcement"
            rows={5}
            defaultValue={setting?.value ?? ""}
            placeholder="Add an important club notice for everyone visiting the site."
            className="input-field"
            maxLength={500}
          />
        </div>

        <button type="submit" className="btn-primary w-fit">
          Save announcement
        </button>
      </form>
    </div>
  );
}
