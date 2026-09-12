import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import UpdateCard from "@/components/UpdateCard";
import { getLatestPosts } from "@/lib/data";

export default async function UpdatesPage() {
  const updates = await getLatestPosts("update", 50);

  return (
    <>
      <PublicNavbar />
      <section className="container-page py-16">
        <h1 className="font-display text-4xl font-bold text-maroon-800">Club Updates</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Meeting announcements, membership news and executive updates.
        </p>
        <div className="mt-10 space-y-4">
          {updates.length > 0 ? (
            updates.map((u) => <UpdateCard key={u.id} post={u} />)
          ) : (
            <p className="text-gray-500">No updates have been published yet.</p>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
