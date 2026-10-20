"use client";

import { useMemo, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, media } from "@/core/lib/gsap";
import { useInView } from "@/core/hooks/useInView";
import { appStore, scrollToSection } from "@/core/store/appStore";
import { pad } from "@/core/lib/cn";
import type { CmsService } from "@/core/content/types";
import { capabilitiesModel, modelKindFor } from "../model/capabilities.model";
import { servicesFromCms } from "../model/capabilities.cms";
import type { ServicesState } from "../view/scene/ServicesCanvas";

/** Pinned scroll length per service, in % of the viewport height. */
const PER_SERVICE = 90;
const LAYERS = 120;

// Kept local (not from core/three) so this module never pulls three.js into the main bundle.
const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function useCapabilitiesController(services?: CmsService[] | null) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<ServicesState>({ progress: 0 });
  const trigger = useRef<ScrollTrigger | null>(null);
  const hud = {
    num: useRef<HTMLSpanElement>(null),
    layer: useRef<HTMLSpanElement>(null),
    status: useRef<HTMLSpanElement>(null),
    bar: useRef<HTMLSpanElement>(null),
  };

  const model = useMemo(
    () => ({ ...capabilitiesModel, services: servicesFromCms(services) ?? capabilitiesModel.services }),
    [services],
  );
  const kinds = useMemo(() => model.services.map(modelKindFor), [model.services]);
  const count = model.services.length;

  // WebGL lives only while the section is near; it renders only while on screen.
  const near = useInView(root, "100% 0px 100% 0px");
  const onScreen = useInView(stage, "0px");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", el);
      const rail = gsap.utils.toArray<HTMLElement>("[data-rail]", el);
      let current = -1;

      const show = (i: number) => {
        if (i === current) return;
        current = i;
        slides.forEach((s, k) => s.toggleAttribute("data-active", k === i));
        rail.forEach((r, k) => {
          r.toggleAttribute("data-active", k === i);
          r.setAttribute("aria-current", k === i ? "step" : "false");
        });
        if (hud.num.current) hud.num.current.textContent = pad(i + 1, 2);
      };

      const render = (p: number) => {
        const x = Math.min(p, 0.99999) * count;
        const i = Math.floor(x);
        const t = x - i;
        show(i);
        const build = smoothstep(0.12, 0.78, t);
        const soon = model.services[i]?.status === "comingSoon";
        if (hud.layer.current) hud.layer.current.textContent = pad(build * LAYERS);
        if (hud.bar.current) hud.bar.current.style.transform = `scaleX(${build})`;
        if (hud.status.current) {
          const text = soon ? model.status.soon : build >= 1 ? model.status.ready : model.status.building;
          if (hud.status.current.textContent !== text) hud.status.current.textContent = text;
        }
      };

      const mm = gsap.matchMedia();
      mm.add(media.motion, () => {
        gsap
          .timeline({ scrollTrigger: { trigger: "[data-cap-head]", start: "top 75%" } })
          .from("[data-cap-head] [data-word]", { yPercent: 100, opacity: 0, duration: 1, stagger: 0.05, ease: "expo.out" })
          .fromTo("[data-cap-head] [data-hl]", { "--hl": 0 }, { "--hl": 1, duration: 0.6 }, "-=0.5")
          .from("[data-cap-fade]", { autoAlpha: 0, y: 24, duration: 0.8 }, "-=0.6");

        trigger.current = ScrollTrigger.create({
          trigger: stage.current,
          start: "top top",
          end: `+=${count * PER_SERVICE}%`,
          pin: true,
          onUpdate: (self) => {
            scene.current.progress = self.progress;
            scene.current.invalidate?.();
            render(self.progress);
          },
        });
        render(0);
        return () => {
          trigger.current = null;
        };
      });

      mm.add(media.reduce, () => {
        // No pin: every service is listed; the scene shows each model finished.
        slides.forEach((s) => s.setAttribute("data-active", ""));
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [count] },
  );

  /** Jump to a service, landing where its model has just finished printing. */
  const goTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const y = st.start + (st.end - st.start) * ((i + 0.82) / count);
    const lenis = appStore.get().lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return { root, stage, scene, hud, kinds, near, onScreen, goTo, contact: () => scrollToSection("contact"), model };
}
