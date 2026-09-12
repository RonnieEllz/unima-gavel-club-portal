import Image from "next/image";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <PublicNavbar />
      <section className="container-page py-16">
        <h1 className="font-display text-4xl font-bold text-maroon-800">About UNIMA Gavel Club</h1>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4 text-gray-600">
            <p>
              The UNIMA Toastmasters Gavel Club is a student-led community at the University of
              Malawi built around one goal: helping members become confident, capable
              communicators and leaders.
            </p>
            <p>
              Through regular meetings, prepared and impromptu speeches, evaluation, and
              rotating leadership roles, members practice real skills in a supportive
              environment, skills that carry far beyond the meeting room.
            </p>
            <p>
              Whatever brought you here, whether overcoming a fear of public speaking, sharpening your
              leadership, or simply finding a community of ambitious peers, there is a place for
              you at Gavel Club.
            </p>
          </div>
          <div className="relative h-72 overflow-hidden rounded-xl shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1560439514-07dfa4b3d3e2?w=1000&q=80"
              alt="Students at a leadership meeting"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
