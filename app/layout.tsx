import type { Metadata } from "next";
import NavigationProgress from "@/components/NavigationProgress";
import SessionTimeout from "@/components/SessionTimeout";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIMA Gavel Club | University of Malawi Toastmasters",
  description:
    "A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavigationProgress />
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}
