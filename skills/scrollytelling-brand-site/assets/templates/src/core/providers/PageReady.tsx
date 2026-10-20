"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/core/lib/gsap";
import { appStore } from "@/core/store/appStore";

/**
 * Pages without the preloader render this instead: it does the preloader's
 * hand-over immediately (unlock the body, mark the app ready, start Lenis and
 * measure every ScrollTrigger once the page has laid out).
 */
export function PageReady() {
  useEffect(() => {
    document.body.dataset.loading = "false";
    if (!appStore.get().ready) appStore.set({ ready: true });
    appStore.get().lenis?.start();
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return null;
}
