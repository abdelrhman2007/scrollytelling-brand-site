"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, media } from "@/core/lib/gsap";
import { appStore } from "@/core/store/appStore";
import type { CaseEffect, CaseStudy } from "../model/caseStudy.model";

type Q = (sel: string) => Element[];

/**
 * Strategy map: one scroll choreography per effect. Each receives a timeline
 * that spans the whole case (0 → 1) and a scoped selector.
 */
const effects: Record<CaseEffect, (tl: gsap.core.Timeline, q: Q) => void> = {
  zoom: (tl, q) => {
    tl.fromTo(q("[data-main]"), { clipPath: "inset(14% 20% 14% 20% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 0.55, ease: "power2.inOut" }, 0)
      .fromTo(q("[data-main] img"), { scale: 1.7 }, { scale: 1, duration: 0.7, ease: "power2.out" }, 0);
    thumbs(tl, q);
  },
  light: (tl, q) => {
    tl.fromTo(q("[data-main] img"), { scale: 1.18, filter: "brightness(0.45) saturate(0.7)" }, { scale: 1, filter: "brightness(1.05) saturate(1)", duration: 0.6 }, 0)
      .fromTo(q("[data-beam]"), { xPercent: -140, opacity: 0 }, { xPercent: 140, opacity: 1, stagger: 0.06, duration: 0.7, ease: "none" }, 0.05)
      .to(q("[data-beam]"), { opacity: 0, duration: 0.15 }, 0.7);
    thumbs(tl, q);
  },
  turn: (tl, q) => {
    const [a, b] = q("[data-turn]");
    tl.fromTo(a, { rotateY: -24, scale: 0.86, opacity: 1 }, { rotateY: 4, scale: 1, duration: 0.45, ease: "power1.inOut" }, 0)
      .to(a, { rotateY: 28, opacity: 0, scale: 0.92, duration: 0.25, ease: "power1.in" }, 0.45);
    if (b) tl.fromTo(b, { rotateY: -28, opacity: 0, scale: 0.92 }, { rotateY: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.55);
    tl.fromTo(q("[data-turntable]"), { rotate: 0 }, { rotate: 90, duration: 1, ease: "none" }, 0);
  },
  wipe: (tl, q) => {
    tl.fromTo(q("[data-main] img"), { scale: 1.12 }, { scale: 1, duration: 0.8 }, 0)
      .fromTo(q("[data-wipe-layer]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power1.inOut" }, 0.12)
      .fromTo(q("[data-scanline]"), { top: "100%", opacity: 1 }, { top: "0%", duration: 0.5, ease: "power1.inOut" }, 0.12)
      .to(q("[data-scanline]"), { opacity: 0, duration: 0.05 }, 0.62);
    thumbs(tl, q);
  },
  pan: (tl, q) => {
    tl.fromTo(q("[data-pan]"), { xPercent: 0, scale: 1.15 }, { xPercent: -22, scale: 1, duration: 1, ease: "none" }, 0);
    thumbs(tl, q);
  },
  stack: (tl, q) => {
    const cards = q("[data-card]");
    const n = cards.length;
    cards.forEach((c, i) => {
      const off = i - (n - 1) / 2;
      tl.fromTo(
        c,
        { xPercent: 0, yPercent: 30 + i * 4, rotate: off * 3, scale: 0.8, opacity: i === 0 ? 1 : 0.6 },
        { xPercent: off * 62, yPercent: Math.abs(off) * 6, rotate: off * 7, scale: 1, opacity: 1, duration: 0.6, ease: "power3.inOut" },
        0.05,
      );
    });
  },
};

function thumbs(tl: gsap.core.Timeline, q: Q) {
  const t = q("[data-thumb]");
  if (t.length) tl.fromTo(t, { yPercent: 140, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.25, ease: "power3.out" }, 0.55);
}

export function useCaseStudyController(project: CaseStudy) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root) as unknown as Q;
      // Tell the shell to flip its contrast while a light case is under the header.
      if (project.theme === "yellow" || project.theme === "paper") {
        const tone = project.theme === "yellow" ? "onYellow" : "onPaper";
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 40px",
          end: "bottom 40px",
          onToggle: (self) => appStore.set({ headerTone: self.isActive ? tone : "default" }),
        });
      }

      const mm = gsap.matchMedia();

      mm.add(media.motion, () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.7 },
        });
        effects[project.effect](tl, q);
        tl.to({}, { duration: 0.1 }, 1);

        // Copy entrance
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 60%", toggleActions: "play none none reverse" } })
          .fromTo(q("[data-title-line]"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" })
          .fromTo(q("[data-info-fade]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, "<0.15");
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [project.id] },
  );

  return { root };
}
