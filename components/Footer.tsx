"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const defaultFooter = {
  footer_description: "A student community at the University of Malawi focused on developing communication, public speaking, leadership and confidence.",
  footer_address: "University of Malawi, Zomba, Malawi",
  footer_email: "gavelclub@unima.ac.mw",
  footer_phone_1: null,
  footer_phone_2: null,
  footer_copyright: "UNIMA Toastmasters Gavel Club. All rights reserved.",
};

type FooterSettings = typeof defaultFooter;

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooter);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase
      .from("landing_page_settings")
      .select("footer_description, footer_address, footer_email, footer_phone_1, footer_phone_2, footer_copyright")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setSettings({ ...defaultFooter, ...(data as Partial<FooterSettings>) });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-ink-900 text-gray-300">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-white">UNIMA Gavel Club</p>
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
            <li><a href="/join" className="hover:text-white">Join Us</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">Contact</p>
          <p className="mt-3 text-sm">{settings.footer_address}</p>
          <a href={`mailto:${settings.footer_email}`} className="text-sm hover:text-white">{settings.footer_email}</a>
          {settings.footer_phone_1 && <a href={`tel:${settings.footer_phone_1}`} className="block text-sm hover:text-white">{settings.footer_phone_1}</a>}
          {settings.footer_phone_2 && <a href={`tel:${settings.footer_phone_2}`} className="block text-sm hover:text-white">{settings.footer_phone_2}</a>}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {settings.footer_copyright}
      </div>
    </footer>
  );
}
