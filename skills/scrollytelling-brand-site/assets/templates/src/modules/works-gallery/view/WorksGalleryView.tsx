"use client";

import type { CmsProject } from "@/core/content/types";
import { cn } from "@/core/lib/cn";
import { CaseStudy } from "../modules/case-study";
import { useWorksGalleryController } from "../controller/useWorksGalleryController";
import s from "./WorksGallery.module.css";

export default function WorksGalleryView({ projects }: { projects?: CmsProject[] | null }) {
  const { root, model, filters, filter, visible, choose } = useWorksGalleryController(projects);

  return (
    <section ref={root} className={s.gallery} aria-label="All projects">
      {filters.length > 1 && (
        <div className={s.bar}>
          <ul className={s.filters} role="group" aria-label={model.filterLabel}>
            <li>
              <button
                type="button"
                className={cn(s.chip, filter === "all" && s.chipActive)}
                aria-pressed={filter === "all"}
                onClick={() => choose("all")}
              >
                {model.allLabel} <small>{model.projects.length}</small>
              </button>
            </li>
            {filters.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={cn(s.chip, filter === f.id && s.chipActive)}
                  aria-pressed={filter === f.id}
                  onClick={() => choose(f.id)}
                >
                  {f.id} <small>{f.count}</small>
                </button>
              </li>
            ))}
          </ul>
          <p className={s.status} aria-live="polite">
            {visible.length} {visible.length === 1 ? "project" : "projects"}
          </p>
        </div>
      )}

      {visible.length ? (
        visible.map((p, i) => (
          <CaseStudy
            key={p.id}
            project={p}
            index={i}
            total={visible.length}
            sectionIndex={model.sectionIndex}
            href={`/works/${p.id}`}
            linkLabel={model.linkLabel}
          />
        ))
      ) : (
        <p className={s.empty}>{model.empty}</p>
      )}
    </section>
  );
}
