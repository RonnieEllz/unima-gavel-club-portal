import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import StoryCard from "@/components/StoryCard";
import { getLatestPosts } from "@/lib/data";

export default async function StoriesPage() {
  const stories = await getLatestPosts("story", 50);

  return (
    <>
      <PublicNavbar />
      <section className="container-page py-16">
        <h1 className="font-display text-4xl font-bold text-maroon-800">Stories & Inspiration</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Leadership lessons, public speaking journeys and reflections from our members.
        </p>
        {stories.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <StoryCard key={s.id} post={s} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-gray-500">No stories have been published yet.</p>
        )}
      </section>
      <Footer />
    </>
  );
}
