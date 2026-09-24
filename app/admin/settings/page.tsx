import { createClient } from "@/lib/supabase/server";
import { createCustomSection, deleteCustomSection, updateAboutPageSettings, updateCustomSection, updateFooterSettings, updateLandingPageSettings, updateSiteAnnouncement, updateWhatsAppGroupLink } from "@/lib/actions/admin";
import { normalizeAnnouncementInput } from "@/lib/announcement";
import { defaultLandingPageSettings } from "@/lib/data";
import ImageUploadField from "@/components/admin/ImageUploadField";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const [{ data: setting }, { data: announcementSetting }, { data: whatsappSetting }, { data: customSections }] = await Promise.all([
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
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_group_link")
      .maybeSingle(),
    supabase
      .from("custom_sections")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
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

  const submitWhatsAppLink = async (formData: FormData) => {
    "use server";
    return updateWhatsAppGroupLink(formData);
  };

  const submitCreateCustomSection = async (formData: FormData) => {
    "use server";
    return createCustomSection(formData);
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
          <input name="gallery_drive_url" type="url" defaultValue={values.gallery_drive_url ?? ""} placeholder="Google Drive photo album URL (optional)" className="input-field" />
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="font-display text-xl font-bold text-maroon-800">SEO</legend>
          <input name="seo_title" defaultValue={values.seo_title} placeholder="SEO title" className="input-field" required />
          <textarea name="seo_description" defaultValue={values.seo_description} placeholder="SEO description" className="input-field" rows={3} required />
          <ImageUploadField name="social_image" label="Social sharing image" currentUrl={values.social_image ?? ""} />
        </fieldset>

      </SettingsForm>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-xl font-bold text-maroon-800">Custom sections</h2>
        <p className="mt-1 text-sm text-gray-600">Add extra content sections to the public landing page.</p>
        <div className="mt-6 grid gap-6">
          {(customSections ?? []).map((section) => {
            const submitUpdate = async (formData: FormData) => {
              "use server";
              return updateCustomSection(section.id, formData);
            };
            const submitDelete = async () => {
              "use server";
              return deleteCustomSection(section.id);
            };
            return (
              <div key={section.id} className="border-t border-gray-200 pt-6">
                <SettingsForm action={submitUpdate} deleteAction={submitDelete} deleteLabel="Delete section" buttonLabel="Save section">
                  <input name="title" defaultValue={section.title} placeholder="Section title" className="input-field" required />
                  <textarea name="content" defaultValue={section.content} placeholder="Section content. Separate paragraphs with a blank line." className="input-field" rows={6} required />
                  <input name="image_url" type="url" defaultValue={section.image_url ?? ""} placeholder="Image URL (optional)" className="input-field" />
                  <input name="image_alt" defaultValue={section.image_alt} placeholder="Image description (optional)" className="input-field" />
                  <input name="display_order" type="number" min="0" defaultValue={section.display_order} placeholder="Display order" className="input-field" required />
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="is_visible" defaultChecked={section.is_visible} /> Show on landing page</label>
                </SettingsForm>
              </div>
            );
          })}
        </div>
      </section>

      <SettingsForm action={submitCreateCustomSection} buttonLabel="Add custom section">
        <h2 className="font-display text-xl font-bold text-maroon-800">Add custom section</h2>
        <input name="title" placeholder="Section title" className="input-field" required />
        <textarea name="content" placeholder="Section content. Separate paragraphs with a blank line." className="input-field" rows={6} required />
        <input name="image_url" type="url" placeholder="Image URL (optional)" className="input-field" />
        <input name="image_alt" placeholder="Image description (optional)" className="input-field" />
        <input name="display_order" type="number" min="0" defaultValue="0" placeholder="Display order" className="input-field" required />
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="is_visible" defaultChecked /> Show on landing page</label>
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
        <input name="footer_instagram_url" type="url" defaultValue={values.footer_instagram_url ?? ""} placeholder="Instagram profile URL (optional)" className="input-field" />
        <input name="footer_tiktok_url" type="url" defaultValue={values.footer_tiktok_url ?? ""} placeholder="TikTok profile URL (optional)" className="input-field" />
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

      <SettingsForm action={submitWhatsAppLink} buttonLabel="Save WhatsApp link">
        <div>
          <label htmlFor="whatsapp_group_link" className="label-field">
            WhatsApp group link for new members
          </label>
          <input
            id="whatsapp_group_link"
            name="whatsapp_group_link"
            type="url"
            defaultValue={whatsappSetting?.value ?? ""}
            placeholder="https://chat.whatsapp.com/..."
            className="input-field"
          />
        </div>
      </SettingsForm>
    </div>
  );
}
