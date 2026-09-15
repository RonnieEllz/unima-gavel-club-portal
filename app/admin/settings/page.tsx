import { createClient } from "@/lib/supabase/server";
import { updateAboutPageSettings, updateFooterSettings, updateLandingPageSettings, updateSiteAnnouncement } from "@/lib/actions/admin";
import { normalizeAnnouncementInput } from "@/lib/announcement";
import { defaultLandingPageSettings } from "@/lib/data";
import ImageUploadField from "@/components/admin/ImageUploadField";
import SettingsForm from "@/components/admin/SettingsForm";

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
    return updateLandingPageSettings(formData);
  };

  const submitAboutSettings = async (formData: FormData) => {
    "use server";
    return updateAboutPageSettings(formData);
  };

  const submitFooterSettings = async (formData: FormData) => {
    "use server";
    return updateFooterSettings(formData);
  };

  const submitAnnouncement = async (formData: FormData) => {
    "use server";
    const normalized = normalizeAnnouncementInput(String(formData.get("announcement") ?? ""));
    if (!normalized.valid) return { error: "Announcement must be 1-500 characters long." };
    return updateSiteAnnouncement(normalized.text);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-maroon-800">Site Settings</h1>
      <p className="mt-2 text-gray-600">
        Manage the public landing page copy, images, visibility, and SEO.
      </p>

      <SettingsForm action={submitLandingSettings} buttonLabel="Save landing page">
        <fieldset className="grid gap-4">
          <legend className="font-display text-xl font-bold text-maroon-800">Hero</legend>
          <input name="hero_eyebrow" defaultValue={values.hero_eyebrow} placeholder="Eyebrow" className="input-field" required />
          <input name="hero_title" defaultValue={values.hero_title} placeholder="Title" className="input-field" required />
          <textarea name="hero_description" defaultValue={values.hero_description} placeholder="Description" className="input-field" rows={3} required />
          <ImageUploadField name="hero_image" label="Hero image" currentUrl={values.hero_image ?? ""} />
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="font-display text-xl font-bold text-maroon-800">Introduction</legend>
          <input name="intro_heading" defaultValue={values.intro_heading} placeholder="Heading" className="input-field" required />
          <textarea name="intro_content" defaultValue={values.intro_content} placeholder="Introduction copy" className="input-field" rows={7} required />
          <ImageUploadField name="intro_image" label="Introduction image" currentUrl={values.intro_image ?? ""} />
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
          <ImageUploadField name="social_image" label="Social sharing image" currentUrl={values.social_image ?? ""} />
        </fieldset>

      </SettingsForm>

      <SettingsForm action={submitAboutSettings} buttonLabel="Save About page">
        <div>
          <h2 className="font-display text-xl font-bold text-maroon-800">About Page</h2>
          <p className="mt-1 text-sm text-gray-600">Edit the public About page independently from the landing page.</p>
        </div>
        <input name="about_heading" defaultValue={values.about_heading} placeholder="About heading" className="input-field" required />
        <textarea name="about_content" defaultValue={values.about_content} placeholder="About text. Separate paragraphs with a blank line." className="input-field" rows={9} required />
        <ImageUploadField name="about_image" label="About image" currentUrl={values.about_image ?? ""} />
        <input name="about_image_alt" defaultValue={values.about_image_alt} placeholder="About image description" className="input-field" required />
      </SettingsForm>

      <SettingsForm action={submitFooterSettings} buttonLabel="Save Footer">
        <div>
          <h2 className="font-display text-xl font-bold text-maroon-800">Footer</h2>
          <p className="mt-1 text-sm text-gray-600">Edit the shared footer independently from the landing and About pages.</p>
        </div>
        <textarea name="footer_description" defaultValue={values.footer_description} placeholder="Footer description" className="input-field" rows={3} required />
        <input name="footer_address" defaultValue={values.footer_address} placeholder="Footer address" className="input-field" required />
        <input name="footer_email" type="email" defaultValue={values.footer_email} placeholder="Footer email" className="input-field" required />
        <input name="footer_phone_1" type="tel" defaultValue={values.footer_phone_1 ?? ""} placeholder="Phone number 1 (optional)" className="input-field" />
        <input name="footer_phone_2" type="tel" defaultValue={values.footer_phone_2 ?? ""} placeholder="Phone number 2 (optional)" className="input-field" />
        <input name="footer_copyright" defaultValue={values.footer_copyright} placeholder="Copyright text" className="input-field" required />
      </SettingsForm>

      <SettingsForm action={submitAnnouncement} buttonLabel="Save announcement">
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
      </SettingsForm>
    </div>
  );
}
