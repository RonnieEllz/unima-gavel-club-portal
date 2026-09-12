"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { usePathname } from "next/navigation";

const MINIMUM_DISPLAY_TIME = 300;

export default function NavigationProgress() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (startedAt.current === null) return;

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, MINIMUM_DISPLAY_TIME - elapsed);
    const timeout = window.setTimeout(() => {
      startedAt.current = null;
      setIsLoading(false);
    }, remaining);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      startedAt.current = Date.now();
      setIsLoading(true);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="navigation-progress" role="progressbar" aria-label="Loading page" aria-valuetext="Loading page">
      <div className="navigation-progress-bar" />
    </div>
  );
}