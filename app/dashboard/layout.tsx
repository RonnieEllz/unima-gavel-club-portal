import { redirect } from "next/navigation";
import MemberNavbar from "@/components/MemberNavbar";
import Footer from "@/components/Footer";
import { getCurrentUserProfile } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getCurrentUserProfile();
  if (!user) redirect("/login");

  // Notification system disabled for now. TODO: proper in-app notification feed.
  const unreadCount = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar isAdmin={isAdmin} unreadCount={unreadCount} />
      <main className="container-page py-10">{children}</main>
      <Footer />
    </div>
  );
}
