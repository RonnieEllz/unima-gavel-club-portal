import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import StoryCard from "@/components/StoryCard";
import UpdateCard from "@/components/UpdateCard";
import MeetingCard from "@/components/MeetingCard";
import { getUpcomingMeeting, getLatestPosts, getGalleryPreview, getSiteAnnouncement, getLandingPageSettings } from "@/lib/data";

export default async function LandingPage() {
  const [meeting, stories, updates, gallery, announcement, settings] = await Promise.all([
    getUpcomingMeeting(),
    getLatestPosts("story", 3),
    getLatestPosts("update", 3),
    getGalleryPreview(8),
    getSiteAnnouncement(),
    getLandingPageSettings(),
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
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/join" className="btn-gold">
              Join the Club
            </Link>
            <Link href="/login" className="btn-secondary !border-white !bg-transparent !text-white hover:!bg-white/10">
              Member Login
            </Link>
          </div>

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
        {gallery.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((g) => (
              <div key={g.id} className="relative aspect-square overflow-hidden rounded-lg bg-maroon-100">
                <Image src={g.image_url} alt={g.caption ?? "Gavel Club photo"} fill className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
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

      <Footer />
    </>
  );
}
