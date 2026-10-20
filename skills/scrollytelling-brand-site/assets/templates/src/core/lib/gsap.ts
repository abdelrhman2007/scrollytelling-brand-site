"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * ScrollTrigger keeps an empty requestAnimationFrame loop alive forever to
 * work around a Firefox repaint quirk. Everywhere else it only stops the
 * browser from ever idling (~3x idle CPU in our measurements). The loop body
 * is a pure no-op (`return enabled && requestAnimationFrame(self)`), so on
 * non-Firefox browsers we simply decline to schedule that one callback.
 * Must run before ScrollTrigger is registered.
 */
function skipScrollTriggerKeepAlive() {
  if (/firefox/i.test(navigator.userAgent)) return;
  const keepAlive = /^function\s*\w*\s*\(\)\s*\{\s*return\s+\w+\s*&&\s*requestAnimationFrame\(\s*\w+\s*\)\s*;?\s*\}$/;
  const verdicts = new WeakMap<FrameRequestCallback, boolean>();
  const isKeepAlive = (cb: FrameRequestCallback) => {
    if (cb.length !== 0) return false; // every real frame callback takes a timestamp
    let v = verdicts.get(cb);
    if (v === undefined) verdicts.set(cb, (v = keepAlive.test(cb.toString())));
    return v;
  };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb: FrameRequestCallback) => (isKeepAlive(cb) ? 0 : raf(cb));
}

if (typeof window !== "undefined") {
  skipScrollTriggerKeepAlive();
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out" });
  ScrollTrigger.config({
    // Phones resize the viewport when the address bar shows/hides; a full
    // refresh there causes a visible jump mid-scroll.
    ignoreMobileResize: true,
    limitCallbacks: true,
  });
}

/** Mechanical, print-head-like easing used across the site. */
export const ease = {
  print: "power2.inOut",
  snap: "expo.out",
  soft: "power3.out",
} as const;

export const media = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
