"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_SESSION_TIMEOUT_MINUTES = 60;

function getSessionTimeoutMs() {
  const configuredMinutes = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES ?? DEFAULT_SESSION_TIMEOUT_MINUTES);
  const safeMinutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0 ? configuredMinutes : DEFAULT_SESSION_TIMEOUT_MINUTES;
  return safeMinutes * 60 * 1000;
}

export default function SessionTimeout() {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);

  const logoutAfterInactivity = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/login?timeout=1");
      router.refresh();
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      void logoutAfterInactivity();
    }, getSessionTimeoutMs());
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart", "pointerdown"];

    const handleActivity = () => resetTimer();

    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleActivity);
      });

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  return null;
}
