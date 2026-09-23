"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const defaultFooter = {
  footer_description: "A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.",
  footer_address: "University of Malawi, Zomba, Malawi",
  footer_email: "gavelclub@unima.ac.mw",
  footer_phone_1: null,
  footer_phone_2: null,
  footer_instagram_url: null,
  footer_tiktok_url: null,
  footer_copyright: "UNIMA Toastmasters Gavel Club. All rights reserved.",
};

type FooterSettings = typeof defaultFooter;

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.25-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M16.5 3c.4 1.7 1.6 3.1 3.2 3.8v2.5a6.5 6.5 0 0 1-3.1-.9v6.7a5.4 5.4 0 1 1-5.4-5.4c.2 0 .4 0 .6.1v2.5a2.9 2.9 0 1 0 2.3 2.8V3h2.4Z" />
    </svg>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooter);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setIsLoggedIn(Boolean(session?.user));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsLoggedIn(Boolean(session?.user));
    });

    void supabase
      .from("landing_page_settings")
      .select("footer_description, footer_address, footer_email, footer_phone_1, footer_phone_2, footer_instagram_url, footer_tiktok_url, footer_copyright")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setSettings({ ...defaultFooter, ...(data as Partial<FooterSettings>) });
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-ink-900 text-gray-300">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-black">
              <Image src="/logo.jpg" alt="UNIMA Gavel Club logo" width={48} height={48} className="h-full w-full object-cover object-center" />
            </span>
            <p className="font-display text-lg font-bold text-white">UNIMA Gavel Club</p>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {settings.footer_description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">About the Club</a></li>
            <li><a href="/stories" className="hover:text-white">Stories</a></li>
            <li><a href="/updates" className="hover:text-white">Updates</a></li>
            {!isLoggedIn && <li><a href="/join" className="hover:text-white">Join Us</a></li>}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">Contact</p>
          <p className="mt-3 text-sm">{settings.footer_address}</p>
          <a href={`mailto:${settings.footer_email}`} className="text-sm hover:text-white">{settings.footer_email}</a>
          {settings.footer_phone_1 && <a href={`tel:${settings.footer_phone_1}`} className="block text-sm hover:text-white">{settings.footer_phone_1}</a>}
          {settings.footer_phone_2 && <a href={`tel:${settings.footer_phone_2}`} className="block text-sm hover:text-white">{settings.footer_phone_2}</a>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {settings.footer_instagram_url && (
              <a href={settings.footer_instagram_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 hover:text-white">
                <InstagramIcon />
                <span>Instagram</span>
              </a>
            )}
            {settings.footer_tiktok_url && (
              <a href={settings.footer_tiktok_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 hover:text-white">
                <TikTokIcon />
                <span>TikTok</span>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {settings.footer_copyright}
      </div>
    </footer>
  );
}
