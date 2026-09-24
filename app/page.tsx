import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import StoryCard from "@/components/StoryCard";
import UpdateCard from "@/components/UpdateCard";
import MeetingCard from "@/components/MeetingCard";
import { getUpcomingMeeting, getLatestPosts, getGalleryPreview, getExecutiveMembers, getSiteAnnouncement, getLandingPageSettings, getCustomSections, getCurrentUserProfile } from "@/lib/data";

export default async function LandingPage() {
  const [{ user }, meeting, stories, updates, gallery, executiveMembers, announcement, settings, customSections] = await Promise.all([
    getCurrentUserProfile(),
    getUpcomingMeeting(),
    getLatestPosts("story", 3),
    getLatestPosts("update", 3),
    getGalleryPreview(8),
    getExecutiveMembers(),
    getSiteAnnouncement(),
    getLandingPageSettings(),
    getCustomSections(),
  ]);

  return (
    <>
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-maroon-800">
        <div className="absolute inset-0">
          <Image
            src={settings.hero_image || "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=80"}
            alt="Students speaking in front of a room"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-maroon-900/60 via-maroon-800/70 to-maroon-800" />
        </div>
        <div className="container-page relative py-24 text-center sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            {settings.hero_eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            {settings.hero_title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-maroon-50">
            {settings.hero_description}
          </p>
          {!user && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/join" className="btn-gold">
                Join the Club
              </Link>
              <Link href="/login" className="btn-secondary !border-white !bg-transparent !text-white hover:!bg-white/10">
                Member Login
              </Link>
            </div>
          )}

          {settings.show_announcement && announcement && (
            <div className="mx-auto mt-8 max-w-2xl rounded-full border border-gold-200/50 bg-white/10 px-4 py-3 text-sm text-gold-100 shadow-lg backdrop-blur-sm">
              {announcement}
            </div>
          )}
        </div>
      </section>

      {/* INTRO */}
      {settings.show_intro && <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-maroon-800">{settings.intro_heading}</h2>
            {settings.intro_content.split("\n\n").map((paragraph) => (
              <p key={paragraph} className="mt-4 text-gray-600">{paragraph}</p>
            ))}
          </div>
          <div className="relative h-72 overflow-hidden rounded-xl shadow-md">
            <Image
              src={settings.intro_image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80"}
              alt={settings.intro_image_alt}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>}

      {customSections.map((section, index) => (
        <section key={section.id} className={index % 2 === 0 ? "container-page py-16" : "bg-maroon-50 py-16"}>
          <div className={`container-page grid gap-10 md:grid-cols-2 md:items-center ${index % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}>
            <div>
              <h2 className="font-display text-3xl font-bold text-maroon-800">{section.title}</h2>
              {section.content.split("\n\n").map((paragraph) => (
                <p key={paragraph} className="mt-4 text-gray-600">{paragraph}</p>
              ))}
            </div>
            {section.image_url && (
              <div className="relative h-72 overflow-hidden rounded-xl shadow-md">
                <Image src={section.image_url} alt={section.image_alt || section.title} fill className="object-cover" />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* UPCOMING MEETING */}
      {settings.show_meeting && <section className="bg-maroon-50 py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-bold text-maroon-800">Upcoming Meeting</h2>
          <div className="mt-6 max-w-2xl">
            {meeting ? (
              <MeetingCard meeting={meeting} />
            ) : (
              <p className="text-gray-500">No upcoming meeting has been scheduled yet. Check back soon.</p>
            )}
          </div>
        </div>
      </section>}

      {/* LATEST STORIES */}
      {settings.show_stories && <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-maroon-800">Latest Stories</h2>
          <Link href="/stories" className="text-sm font-semibold text-maroon-700 hover:underline">
            View all
          </Link>
        </div>
        {stories.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <StoryCard key={s.id} post={s} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-gray-500">Stories from our members will appear here soon.</p>
        )}
      </section>}

      {/* LATEST UPDATES */}
      {settings.show_updates && <section className="bg-gray-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold text-maroon-800">Latest Updates</h2>
            <Link href="/updates" className="text-sm font-semibold text-maroon-700 hover:underline">
              View all
            </Link>
          </div>
          {updates.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {updates.map((u) => (
                <UpdateCard key={u.id} post={u} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-gray-500">Club announcements will appear here soon.</p>
          )}
        </div>
      </section>}

      {/* GALLERY */}
      {settings.show_gallery && <section className="container-page py-16">
        <h2 className="font-display text-3xl font-bold text-maroon-800">Photo Gallery</h2>
        <p className="mt-2 text-gray-600">Moments from our meetings, trainings and events.</p>
        {gallery.length > 0 ? (() => {
          const driveUrl = settings.gallery_drive_url?.trim();
          const galleryCards = [...gallery];

          return (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {driveUrl && (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group relative block aspect-square overflow-hidden rounded-lg border border-dashed border-maroon-300 bg-maroon-50 focus:outline-none focus:ring-2 focus:ring-maroon-500"
                  aria-label="View more club photos"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-maroon-100">
                    <Image src={galleryCards[0]?.image_url ?? "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&q=80"} alt="More club photos" fill className="object-cover opacity-90 transition duration-200 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                      <span className="inline-flex rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-maroon-800">
                        View more
                      </span>
                      <p className="mt-2 text-sm font-semibold text-white">Club photo collection</p>
                    </div>
                  </div>
                </a>
              )}

              {galleryCards.filter((g, index) => !(driveUrl && index === 0)).map((g) => (
                <div key={g.id} className="relative aspect-square overflow-hidden rounded-lg bg-maroon-100">
                  <Image src={g.image_url} alt={g.caption ?? "Gavel Club photo"} fill className="object-cover" />
                </div>
              ))}
            </div>
          );
        })() : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Placeholder tiles. Admins can replace them by uploading real photos in /admin/gallery */}
            {[
              "photo-1523580494863-6f3031224c94",
              "photo-1517245386807-bb43f82c33c4",
              "photo-1560439514-4e9645039924",
              "photo-1524178232363-1fb2b075b655",
            ].map((id) => (
              <div key={id} className="relative aspect-square overflow-hidden rounded-lg bg-maroon-100">
                <Image
                  src={`https://images.unsplash.com/${id}?w=500&q=80`}
                  alt="Placeholder club photo"
                  fill
                  className="object-cover opacity-80"
                />
              </div>
            ))}
          </div>
        )}
      </section>}

      {executiveMembers.length > 0 && <section className="bg-maroon-50 py-16">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl font-bold text-maroon-800">Our Executive Members</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {executiveMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="mx-auto aspect-square w-32 overflow-hidden rounded-full border-4 border-white bg-maroon-100 shadow-md sm:w-36">
                  <Image src={member.image_url} alt={member.caption ?? "Executive member"} width={144} height={144} className="h-full w-full object-cover" />
                </div>
                {member.caption && <p className="mt-3 text-sm font-semibold text-maroon-800">{member.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>}

      <Footer />
    </>
  );
}
