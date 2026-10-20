"use client";

import type { RefObject } from "react";
import { gsap, useGSAP, media } from "@/core/lib/gsap";

/**
 * Light, one-shot scroll reveal for page sections: every `[data-rise]` inside
 * `scope` fades up once when it enters the viewport, and SplitWords inside a
 * `[data-rise-words]` heading rise word by word. Each trigger kills itself
 * after playing (`once`), so nothing keeps listening to scroll.
 * Reduced motion: content is simply shown.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(media.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-rise-words]").forEach((el) => {
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } })
            .from(el.querySelectorAll("[data-word]"), { yPercent: 100, opacity: 0, duration: 0.9, stagger: 0.04, ease: "expo.out" })
            .fromTo(el.querySelectorAll("[data-hl]"), { "--hl": 0 }, { "--hl": 1, duration: 0.6, ease: "expo.out" }, "-=0.5");
        });
        gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => {
          gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
