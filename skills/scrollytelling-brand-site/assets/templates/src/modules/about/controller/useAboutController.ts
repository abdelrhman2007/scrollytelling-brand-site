"use client";

import { useRef } from "react";
import { gsap, useGSAP, media } from "@/core/lib/gsap";
import { aboutModel } from "../model/about.model";

export function useAboutController() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(media.motion, () => {
        // Statement: words "print" in as you read.
        const words = gsap.utils.toArray<HTMLElement>("[data-statement] [data-word]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-statement]", start: "top 78%", end: "bottom 45%", scrub: 0.6 },
        });
        words.forEach((w, i) => {
          tl.fromTo(w, { opacity: 0.12, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "none" }, i * 0.12);
          if (w.dataset.hl) tl.fromTo(w, { "--hl": 0 }, { "--hl": 1, duration: 0.5, ease: "power2.out" }, i * 0.12 + 0.2);
        });

        gsap.from("[data-label-line]", {
          scaleX: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 80%" },
        });

        // Image: clip reveal + inner parallax
        gsap.fromTo(
          "[data-about-media]",
          { clipPath: "inset(18% 12% 18% 12% round 18px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 18px)",
            ease: "none",
            scrollTrigger: { trigger: "[data-about-media]", start: "top 90%", end: "center 55%", scrub: true },
          },
        );
        gsap.fromTo(
          "[data-about-media] img",
          { scale: 1.25, yPercent: -6 },
          {
            scale: 1.05,
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: "[data-about-media]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        gsap.from("[data-about-copy] > *", {
          y: 40,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: "[data-about-copy]", start: "top 80%" },
        });

        gsap.utils.toArray<HTMLElement>("[data-fact]").forEach((f, i) => {
          gsap.from(f, {
            y: 60,
            autoAlpha: 0,
            duration: 1,
            delay: i * 0.08,
            scrollTrigger: { trigger: f, start: "top 90%" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return { root, model: aboutModel };
}
