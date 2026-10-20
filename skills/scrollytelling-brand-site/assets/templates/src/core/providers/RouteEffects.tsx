"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/core/lib/gsap";
import { appStore, scrollToHash } from "@/core/store/appStore";

/**
 * Client-side navigation reset, mounted once in the root layout.
 *
 * On every pathname change: close the menu, clear per-page shell state, make
 * sure scrolling is unlocked, jump to the top, then — once the new page's
 * modules have mounted and created their triggers — re-measure ScrollTrigger
 * and honour a `#section` hash (e.g. `/#contact` from another page).
 *
 * On the very first load the preloader (home) or <PageReady/> (other pages)
 * owns the hand-over, so only the hash is handled, after `ready`.
 */
export function RouteEffects() {
  const pathname = usePathname();
  // Last pathname we handled; null until the first load. Comparing paths (not
  // a "first run" flag) keeps StrictMode's effect replay from acting as a navigation.
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (handled.current === null || handled.current === pathname) {
      handled.current = pathname;
      if (!window.location.hash) return;
      const settle = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          scrollToHash();
        });
      };
      if (appStore.get().ready) {
        settle();
        return;
      }
      const unsubscribe = appStore.subscribe(() => {
        if (!appStore.get().ready) return;
        unsubscribe();
        settle();
      });
      return () => {
        unsubscribe();
      };
    }

    handled.current = pathname;
    const { lenis } = appStore.get();
    appStore.set({ menuOpen: false, headerTone: "default", activeSection: "top" });
    document.body.dataset.loading = "false";
    document.documentElement.style.removeProperty("overflow");
    lenis?.start();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);

    // Two frames: the new page has committed, laid out and created its triggers.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
        if (window.location.hash) scrollToHash();
        else ScrollTrigger.update();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  return null;
}
