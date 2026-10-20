"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CmsProject } from "@/core/content/types";
import { disciplineOrder, type ProjectDiscipline } from "@/core/content/projects";
import { ScrollTrigger } from "@/core/lib/gsap";
import { appStore } from "@/core/store/appStore";
import { worksGalleryModel } from "../model/worksGallery.model";
import { galleryFromCms } from "../model/worksGallery.cms";

export type GalleryFilter = ProjectDiscipline | "all";

export function useWorksGalleryController(projects?: CmsProject[] | null) {
  const root = useRef<HTMLElement>(null);
  const model = useMemo(
    () => ({ ...worksGalleryModel, projects: galleryFromCms(projects) ?? worksGalleryModel.projects }),
    [projects],
  );
  const [filter, setFilter] = useState<GalleryFilter>("all");

  // Only disciplines that actually have projects, in a stable order.
  const filters = useMemo(() => {
    const counts = new Map<ProjectDiscipline, number>();
    model.projects.forEach((p) => counts.set(p.discipline, (counts.get(p.discipline) ?? 0) + 1));
    return disciplineOrder.filter((d) => counts.has(d)).map((d) => ({ id: d, count: counts.get(d)! }));
  }, [model.projects]);

  const visible = useMemo(
    () => (filter === "all" ? model.projects : model.projects.filter((p) => p.discipline === filter)),
    [filter, model.projects],
  );

  // The set of pinned-feeling cases changed: re-measure every trigger once the
  // new cases have mounted (their own triggers are created in layout effects).
  const firstRun = useRef(true);
  useLayoutEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [filter]);

  const choose = (next: GalleryFilter) => {
    if (next === filter) return;
    setFilter(next);
    // A light case may have been under the header when it disappeared.
    appStore.set({ headerTone: "default" });
    // Bring the start of the list back under the filter bar.
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) {
      const { lenis } = appStore.get();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    }
  };

  return { root, model, filters, filter, visible, choose };
}
