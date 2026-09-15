import Image from "next/image";
import PublicNavbar from "@/components/PublicNavbarClient";
import Footer from "@/components/Footer";
import { defaultLandingPageSettings, getLandingPageSettings } from "@/lib/data";

export default async function AboutPage() {
  const settings = await getLandingPageSettings();
  return (
    <>
      <PublicNavbar />
      <section className="container-page py-16">
        <h1 className="font-display text-4xl font-bold text-maroon-800">{settings.about_heading ?? defaultLandingPageSettings.about_heading}</h1>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4 text-gray-600">
            {settings.about_content.split("\n\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="relative h-72 overflow-hidden rounded-xl shadow-md">
            <Image
              src={settings.about_image || "https://images.unsplash.com/photo-1560439514-07dfa4b3d3e2?w=1000&q=80"}
              alt={settings.about_image_alt}
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
