import type Lenis from "lenis";
import { createStore } from "./createStore";

type AppState = {
  /** Preloader finished and the stage is revealed. */
  ready: boolean;
  menuOpen: boolean;
  lenis: Lenis | null;
  activeSection: string;
  /** Header contrast mode, set by sections with light/yellow backgrounds. */
  headerTone: "default" | "onYellow" | "onPaper";
};

export const appStore = createStore<AppState>({
  ready: false,
  menuOpen: false,
  lenis: null,
  activeSection: "top",
  headerTone: "default",
});

export const useApp = appStore.useStore;

/** Scroll to an anchor through Lenis when available. */
export function scrollToSection(id: string) {
  const target = id === "top" ? 0 : `#${id}`;
  const { lenis } = appStore.get();
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (typeof target === "number") window.scrollTo({ top: 0, behavior: "smooth" });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Jump to the element named by the URL hash (after a client navigation such
 * as `/works` → `/#contact`). Instant, so no scroll-driven scene in between
 * has to play. Returns false when there is no such element.
 */
export function scrollToHash(hash = typeof window === "undefined" ? "" : window.location.hash) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return false;
  const { lenis } = appStore.get();
  if (lenis) lenis.scrollTo(id === "top" ? 0 : el, { immediate: true, force: true });
  else if (id === "top") window.scrollTo(0, 0);
  else el.scrollIntoView();
  return true;
}
