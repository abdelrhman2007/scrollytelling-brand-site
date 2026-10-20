"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/core/lib/gsap";
import { appStore } from "@/core/store/appStore";

/** Frames of stillness before the scroll loop goes to sleep (~0.5 s). */
const SLEEP_AFTER_FRAMES = 30;

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and
 * Lenis share a single frame clock. Disabled for reduced-motion users.
 *
 * The loop sleeps when the page is still and wakes on any scroll intent, so
 * an idle page costs no main-thread time at all.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      appStore.set({ lenis: null });
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    let awake = false;
    let stillFrames = 0;
    const tick = (time: number) => {
      lenis.raf(time * 1000);
      if (lenis.isScrolling) stillFrames = 0;
      else if (++stillFrames > SLEEP_AFTER_FRAMES) sleep();
    };
    const wake = () => {
      stillFrames = 0;
      if (awake) return;
      awake = true;
      gsap.ticker.add(tick);
    };
    const sleep = () => {
      if (!awake) return;
      awake = false;
      gsap.ticker.remove(tick);
    };

    // Programmatic scrolls (menu, project index, back to top) must wake it too.
    const scrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = ((...args: Parameters<Lenis["scrollTo"]>) => {
      wake();
      return scrollTo(...args);
    }) as Lenis["scrollTo"];

    const intents = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"] as const;
    intents.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    wake();

    // Stay locked until the preloader hands over.
    if (!appStore.get().ready) lenis.stop();
    appStore.set({ lenis });

    return () => {
      intents.forEach((e) => window.removeEventListener(e, wake));
      sleep();
      lenis.destroy();
      appStore.set({ lenis: null });
    };
  }, []);

  return <>{children}</>;
}
