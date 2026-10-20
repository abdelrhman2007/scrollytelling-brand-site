"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, media } from "@/core/lib/gsap";
import { useApp } from "@/core/store/appStore";
import { useInView } from "@/core/hooks/useInView";
import { pad } from "@/core/lib/cn";
import { heroModel as model } from "../model/hero.model";

/** Shared, mutable print progress read by the WebGL loop every frame. */
export type PrintState = { target: number; invalidate?: () => void };

export function useHeroController() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const print = useRef<PrintState>({ target: 0 });

  const hud = {
    layer: useRef<HTMLSpanElement>(null),
    z: useRef<HTMLSpanElement>(null),
    pct: useRef<HTMLSpanElement>(null),
    status: useRef<HTMLSpanElement>(null),
    bar: useRef<HTMLSpanElement>(null),
  };

  const ready = useApp((s) => s.ready);
  const inView = useInView(section, "100px");
  // Mount the WebGL canvas only within ~1 screen of the hero; unmounting frees
  // its GPU memory while the visitor reads the rest of the page.
  const near = useInView(section, "100% 0px 100% 0px");

  const renderHud = (p: number) => {
    if (hud.layer.current) hud.layer.current.textContent = pad(p * model.totalLayers);
    if (hud.z.current) hud.z.current.textContent = (p * 48).toFixed(2);
    if (hud.pct.current) hud.pct.current.textContent = pad(p * 100);
    if (hud.bar.current) hud.bar.current.style.transform = `scaleX(${p})`;
    if (hud.status.current) {
      const text = p < 0.01 ? "Ready to print" : p < 0.985 ? "Printing" : "Print complete";
      if (hud.status.current.textContent !== text) hud.status.current.textContent = text;
    }
  };

  // Scroll → print progress + copy choreography (built once, on mount).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(media.motion, () => {
        // Hidden until the entrance / scroll choreography reveals them.
        gsap.set('[data-phase="seen"] [data-line-intro]', { yPercent: 110 });

        ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: `+=${model.scrollLength}%`,
          pin: pin.current,
          scrub: true,
          onUpdate: (self) => {
            print.current.target = self.progress;
            print.current.invalidate?.();
            renderHud(self.progress);
          },
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: `+=${model.scrollLength}%`,
            scrub: 0.8,
          },
        });

        // Scroll fades the *children* of cue/kicker; the entrance animates the
        // wrappers. Two timelines on one property would record stale values.
        tl.fromTo("[data-cue] > *", { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 20, duration: 0.05 }, 0)
          .to('[data-phase="seen"] [data-line-inner]', { yPercent: -110, stagger: 0.02, duration: 0.1 }, 0.22)
          .fromTo('[data-phase="seen"] [data-kicker] > *', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.06 }, 0.22)
          .fromTo(
            '[data-phase="layer"] [data-line-inner]',
            { yPercent: 110 },
            { yPercent: 0, stagger: 0.025, duration: 0.12 },
            0.34,
          )
          .fromTo('[data-phase="layer"] [data-kicker]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.34)
          .fromTo(
            '[data-phase="layer"] [data-hl]',
            { "--hl": 0 },
            { "--hl": 1, duration: 0.08, ease: "power3.out" },
            0.46,
          )
          .to('[data-phase="layer"] [data-line-inner]', { yPercent: -110, stagger: 0.02, duration: 0.1 }, 0.66)
          .to('[data-phase="layer"] [data-kicker]', { autoAlpha: 0, duration: 0.06 }, 0.66)
          .fromTo(
            "[data-service]",
            { yPercent: 115 },
            { yPercent: 0, stagger: 0.04, duration: 0.14 },
            0.76,
          )
          .fromTo("[data-hero-tagline]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.86)
          .to({}, { duration: 0.04 }, 0.96);
      });

      mm.add(media.reduce, () => {
        print.current.target = 1;
        print.current.invalidate?.();
        renderHud(1);
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  // Entrance once the preloader hands over.
  useGSAP(
    () => {
      if (!ready) return;
      gsap
        .timeline({ delay: 0.15 })
        .fromTo(
          '[data-phase="seen"] [data-line-intro]',
          { yPercent: 110 },
          { yPercent: 0, duration: 1.2, stagger: 0.09, ease: "expo.out" },
        )
        .fromTo(
          '[data-phase="seen"] [data-hl]',
          { "--hl": 0 },
          { "--hl": 1, duration: 0.7, ease: "expo.out" },
          "-=0.6",
        )
        .fromTo(
          ['[data-phase="seen"] [data-kicker]', "[data-hud]", "[data-cue]"],
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 },
          "-=0.9",
        );
    },
    { scope: section, dependencies: [ready] },
  );

  return { section, pin, print, hud, inView, near, model };
}
