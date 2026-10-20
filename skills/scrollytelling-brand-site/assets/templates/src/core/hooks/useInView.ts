"use client";

import { useEffect, useState, type RefObject } from "react";

/** True while the element is near the viewport — used to pause WebGL loops. */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
