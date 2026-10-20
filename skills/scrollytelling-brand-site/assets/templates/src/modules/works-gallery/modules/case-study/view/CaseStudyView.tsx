"use client";

import Image from "next/image";
import Link from "next/link";
import { PixelTag } from "@/core/ui";
import type { CaseStudy } from "../model/caseStudy.model";
import { useCaseStudyController } from "../controller/useCaseStudyController";
import s from "./CaseStudy.module.css";

export default function CaseStudyView({
  project,
  index,
  total,
  sectionIndex,
  href,
  linkLabel = "View project",
}: {
  project: CaseStudy;
  index: number;
  total: number;
  sectionIndex: string;
  /** Detail page; omit to render the case without a link. */
  href?: string;
  linkLabel?: string;
}) {
  const { root } = useCaseStudyController(project);
  const num = String(index + 1).padStart(2, "0");

  return (
    <article ref={root} id={`work-${project.id}`} className={s.case} data-theme={project.theme ?? "navy"} aria-labelledby={`case-${project.id}`}>
      <div className={s.sticky}>
        <div className={s.stage} data-effect={project.effect}>
          <Stage project={project} />
        </div>

        <div className={s.info}>
          <div className={s.meta} data-info-fade>
            <span className={s.counter}>
              {sectionIndex}.{num} <i>/ {String(total).padStart(2, "0")}</i>
            </span>
            <PixelTag tone={project.theme === "yellow" ? "navy" : "solid"}>{project.discipline}</PixelTag>
          </div>
          <h3 id={`case-${project.id}`} className={s.title}>
            {project.title.split(" ").map((w, i) => (
              <span key={i} className={s.mask}>
                <span data-title-line>{w}</span>
              </span>
            ))}
          </h3>
          <p className={s.category} data-info-fade>
            {project.category}
          </p>
          <p className={s.summary} data-info-fade>
            {project.summary}
          </p>
          <ul className={s.highlights} data-info-fade>
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          {href && (
            <Link href={href} className={s.link} data-info-fade data-cursor="Open" aria-label={`${linkLabel}: ${project.title}`}>
              {linkLabel} <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

const SIZES = "(max-width: 900px) 100vw, 60vw";

function Stage({ project }: { project: CaseStudy }) {
  const [first, second] = project.images;

  switch (project.effect) {
    case "turn":
      return (
        <div className={s.turnStage}>
          <span className={s.turntable} data-turntable aria-hidden />
          {project.images.slice(0, 2).map((im) => (
            <div key={im.src} className={s.turnCard} data-turn>
              <Image src={im.src} alt={im.alt} fill sizes={SIZES} />
            </div>
          ))}
        </div>
      );

    case "stack":
      return (
        <div className={s.stackStage}>
          {project.images.map((im, i) => (
            <div key={im.src} className={s.card} data-card style={{ zIndex: project.images.length - i }}>
              <Image src={im.src} alt={im.alt} fill sizes="(max-width: 900px) 60vw, 26vw" />
            </div>
          ))}
        </div>
      );

    case "pan":
      return (
        <>
          <div className={s.main} data-main>
            <div className={s.pan} data-pan>
              <Image src={first.src} alt={first.alt} fill sizes="90vw" />
            </div>
          </div>
          <Thumbs images={project.images.slice(1)} />
        </>
      );

    case "wipe":
      return (
        <>
          <div className={s.main} data-main data-cursor="Plan → Model">
            <Image src={first.src} alt={first.alt} fill sizes={SIZES} />
            {second && (
              <div className={s.wipeLayer} data-wipe-layer>
                <Image src={second.src} alt={second.alt} fill sizes={SIZES} />
              </div>
            )}
            <span className={s.scanline} data-scanline aria-hidden />
          </div>
          <Thumbs images={project.images.slice(2)} />
        </>
      );

    case "light":
      return (
        <>
          <div className={s.main} data-main>
            <Image src={first.src} alt={first.alt} fill sizes={SIZES} />
            <div className={s.beams} aria-hidden>
              <span data-beam />
              <span data-beam />
              <span data-beam />
            </div>
          </div>
          <Thumbs images={project.images.slice(1)} />
        </>
      );

    default:
      return (
        <>
          <div className={s.main} data-main>
            <Image src={first.src} alt={first.alt} fill sizes={SIZES} />
          </div>
          <Thumbs images={project.images.slice(1)} />
        </>
      );
  }
}

function Thumbs({ images }: { images: CaseStudy["images"] }) {
  if (!images.length) return null;
  return (
    <ul className={s.thumbs}>
      {images.map((im) => (
        <li key={im.src} className={s.thumb} data-thumb>
          <Image src={im.src} alt={im.alt} fill sizes="200px" />
        </li>
      ))}
    </ul>
  );
}
