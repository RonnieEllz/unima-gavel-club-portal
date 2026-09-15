import { redirect } from "next/navigation";
import MemberNavbar from "@/components/MemberNavbar";
import Footer from "@/components/Footer";
import { getCurrentUserProfile } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getCurrentUserProfile();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar isAdmin={isAdmin} />
      <main className="container-page py-10">{children}</main>
      <Footer />
    </div>
  );
}
