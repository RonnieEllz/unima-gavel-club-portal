import { createClient } from "@/lib/supabase/server";
import { updateLandingPageSettings, updateSiteAnnouncement } from "@/lib/actions/admin";
import { normalizeAnnouncementInput } from "@/lib/announcement";
import { defaultLandingPageSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const [{ data: setting }, { data: announcementSetting }] = await Promise.all([
    supabase
    .from("landing_page_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle(),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "announcement_text")
      .maybeSingle(),
  ]);
  const values = { ...defaultLandingPageSettings, ...(setting ?? {}) };

  const submitLandingSettings = async (formData: FormData) => {
    "use server";
    await updateLandingPageSettings(formData);
  };

  const submitAnnouncement = async (formData: FormData) => {
    "use server";
    const normalized = normalizeAnnouncementInput(String(formData.get("announcement") ?? ""));
    if (!normalized.valid) throw new Error("Announcement must be 1-500 characters long.");
    await updateSiteAnnouncement(normalized.text);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Site Settings</h1>
      <p className="mt-2 text-gray-600">
        Manage the public landing page copy, calls to action, images, visibility, and SEO.
      </p>

      <form action={submitLandingSettings} className="card mt-6 grid gap-6 p-6">
        <fieldset className="grid gap-4">
          <legend className="font-display text-xl font-bold text-maroon-800">Hero</legend>
          <input name="hero_eyebrow" defaultValue={values.hero_eyebrow} placeholder="Eyebrow" className="input-field" required />
          <input name="hero_title" defaultValue={values.hero_title} placeholder="Title" className="input-field" required />
          <textarea name="hero_description" defaultValue={values.hero_description} placeholder="Description" className="input-field" rows={3} required />
          <input name="hero_image" defaultValue={values.hero_image ?? ""} placeholder="Hero image URL (optional)" className="input-field" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="primary_cta_label" defaultValue={values.primary_cta_label} placeholder="Primary button label" className="input-field" required />
            <input name="primary_cta_url" defaultValue={values.primary_cta_url} placeholder="Primary button path" className="input-field" required />
            <input name="secondary_cta_label" defaultValue={values.secondary_cta_label} placeholder="Secondary button label" className="input-field" required />
            <input name="secondary_cta_url" defaultValue={values.secondary_cta_url} placeholder="Secondary button path" className="input-field" required />
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="font-display text-xl font-bold text-maroon-800">Introduction</legend>
          <input name="intro_heading" defaultValue={values.intro_heading} placeholder="Heading" className="input-field" required />
          <textarea name="intro_content" defaultValue={values.intro_content} placeholder="Introduction copy" className="input-field" rows={7} required />
          <input name="intro_image" defaultValue={values.intro_image ?? ""} placeholder="Introduction image URL (optional)" className="input-field" />
          <input name="intro_image_alt" defaultValue={values.intro_image_alt} placeholder="Image description" className="input-field" required />
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-display text-xl font-bold text-maroon-800">Visible sections</legend>
          {[
            ["show_announcement", "Announcement banner", values.show_announcement],
            ["show_intro", "Introduction", values.show_intro],
            ["show_meeting", "Upcoming meeting", values.show_meeting],
            ["show_stories", "Latest stories", values.show_stories],
            ["show_updates", "Latest updates", values.show_updates],
            ["show_gallery", "Photo gallery", values.show_gallery],
          ].map(([name, label, checked]) => (
            <label key={String(name)} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />
              {String(label)}
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="font-display text-xl font-bold text-maroon-800">SEO</legend>
          <input name="seo_title" defaultValue={values.seo_title} placeholder="SEO title" className="input-field" required />
          <textarea name="seo_description" defaultValue={values.seo_description} placeholder="SEO description" className="input-field" rows={3} required />
          <input name="social_image" defaultValue={values.social_image ?? ""} placeholder="Social sharing image URL (optional)" className="input-field" />
        </fieldset>

        <div>
          <button type="submit" className="btn-primary w-fit">
            Save landing page
          </button>
        </div>
      </form>

      <form action={submitAnnouncement} className="card mt-6 grid gap-4 p-6">
        <div>
          <label htmlFor="announcement" className="label-field">
            Landing page announcement
          </label>
          <textarea
            id="announcement"
            name="announcement"
            rows={4}
            defaultValue={announcementSetting?.value ?? ""}
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
