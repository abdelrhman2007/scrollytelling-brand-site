"use client";

import dynamic from "next/dynamic";
import { PixelTag, SectionLabel, SplitWords } from "@/core/ui";
import { WebGLGuard } from "@/core/three/WebGLGuard";
import type { CmsService } from "@/core/content/types";
import { useCapabilitiesController } from "../controller/useCapabilitiesController";
import s from "./Capabilities.module.css";

const ServicesCanvas = dynamic(() => import("./scene/ServicesCanvas"), { ssr: false });

export default function CapabilitiesView({ services }: { services?: CmsService[] | null }) {
  const { root, stage, scene, hud, kinds, near, onScreen, goTo, contact, model } = useCapabilitiesController(services);
  const total = String(model.services.length).padStart(2, "0");

  return (
    <section id="capabilities" ref={root} className={`${s.capabilities} blueprint`}>
      <header className={s.head} data-cap-head>
        <SectionLabel index={model.index}>{model.label}</SectionLabel>
        <h2 className={s.title}>
          <SplitWords text={model.title} />
        </h2>
        <p className={s.intro} data-cap-fade>
          {model.intro}
        </p>
      </header>

      <div ref={stage} className={s.stage}>
        <div className={s.canvas} aria-hidden>
          {near && (
            <WebGLGuard>
              <ServicesCanvas state={scene} kinds={kinds} active={onScreen} />
            </WebGLGuard>
          )}
        </div>
        <div className={s.vignette} aria-hidden />

        <div className={s.copy}>
          {model.services.map((sv, i) => {
            const soon = sv.status === "comingSoon";
            return (
              <article
                key={sv.id}
                className={s.slide}
                data-slide
                data-active={i === 0 ? "" : undefined}
                aria-labelledby={`svc-${sv.id}`}
              >
                <span className={s.num} aria-hidden>
                  {sv.number}
                </span>
                <div className={s.tags}>
                  <PixelTag tone="ghost">{sv.kicker}</PixelTag>
                  {soon && <PixelTag>{model.comingSoon}</PixelTag>}
                </div>
                <h3 id={`svc-${sv.id}`} className={s.slideTitle}>
                  {sv.title}
                </h3>
                <p className={s.desc}>{sv.description || sv.summary}</p>
                {sv.tags.length > 0 && (
                  <ul className={s.chips}>
                    {sv.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <button type="button" className={s.cta} onClick={contact}>
                  {model.cta} <span aria-hidden>→</span>
                </button>
              </article>
            );
          })}
        </div>

        <nav className={s.rail} aria-label="Services">
          {model.services.map((sv, i) => (
            <button
              key={sv.id}
              type="button"
              className={s.railItem}
              data-rail
              data-active={i === 0 ? "" : undefined}
              aria-current={i === 0 ? "step" : "false"}
              onClick={() => goTo(i)}
              data-cursor={sv.title}
            >
              <span className={s.railNum}>{sv.number}</span>
              <span className={s.railLabel}>{sv.kicker}</span>
            </button>
          ))}
        </nav>

        <div className={s.hud} aria-hidden>
          <span>
            Service <b ref={hud.num}>01</b>/{total}
          </span>
          <span>
            Layer <b ref={hud.layer}>000</b>/120
          </span>
          <span ref={hud.status} className={s.hudStatus}>
            {model.status.building}
          </span>
          <span className={s.hudBar}>
            <span ref={hud.bar} />
          </span>
        </div>
      </div>
    </section>
  );
}
