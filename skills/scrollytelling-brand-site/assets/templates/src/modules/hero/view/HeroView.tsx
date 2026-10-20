"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { brand } from "@/core/config/brand";
import { WebGLGuard } from "@/core/three/WebGLGuard";
import { Dots, PixelTag, SplitWords } from "@/core/ui";
import { useHeroController } from "../controller/useHeroController";
import s from "./Hero.module.css";

const HeroCanvas = dynamic(() => import("./scene/HeroCanvas"), { ssr: false });

export default function HeroView() {
  const { section, pin, print, hud, inView, near, model } = useHeroController();

  return (
    <section id="top" ref={section} className={s.hero} aria-label="Demo — The House of Prototyping">
      <div ref={pin} className={`${s.pin} blueprint`}>
        <div className={s.canvas} aria-hidden>
          {near && (
            <WebGLGuard>
              <HeroCanvas state={print} active={inView} modelSrc={model.model.src} />
            </WebGLGuard>
          )}
        </div>
        <div className={s.vignette} aria-hidden />

        <div className={s.copy}>
          {model.phases.map((phase, i) => {
            const Heading = i === 0 ? "h1" : "p";
            return (
            <div key={phase.id} className={s.phase} data-phase={phase.id}>
              {phase.kicker && (
                <div className={s.kicker} data-kicker>
                  <PixelTag tone={i === 0 ? "solid" : "ghost"}>{phase.kicker}</PixelTag>
                </div>
              )}
              <Heading className={s.title} aria-label={phase.lines.join(" ").replace(/\[\[|\]\]/g, "")}>
                {phase.lines.map((line, li) => (
                  <span key={li} className={s.line} aria-hidden>
                    <span className={s.lineInner} data-line-intro>
                      <span className={s.lineInner} data-line-inner>
                        <SplitWords text={line} />
                      </span>
                    </span>
                  </span>
                ))}
              </Heading>
            </div>
            );
          })}

          <div className={s.phase} data-phase="services">
            <ul className={s.services}>
              {model.services.map((sv) => (
                <li key={sv} className={s.line}>
                  <span className={s.service} data-service>
                    {sv}
                  </span>
                </li>
              ))}
            </ul>
            <div className={s.tagline} data-hero-tagline>
              <Image src={brand.logo.tagline} alt="The House of Prototyping" width={924} height={111} />
            </div>
          </div>
        </div>

        <aside className={s.hud} data-hud aria-hidden>
          <div className={s.hudRow}>
            <span className={s.hudKey}>Job</span>
            <span>{model.jobName}</span>
          </div>
          <div className={s.hudRow}>
            <span className={s.hudKey}>Layer</span>
            <span>
              <span ref={hud.layer}>000</span>/{model.totalLayers}
            </span>
          </div>
          <div className={s.hudRow}>
            <span className={s.hudKey}>Z</span>
            <span>
              <span ref={hud.z}>0.00</span> mm
            </span>
          </div>
          <div className={s.hudRow}>
            <span className={s.hudKey}>Status</span>
            <span ref={hud.status} className={s.hudStatus}>
              Ready to print
            </span>
          </div>
          <div className={s.hudBar}>
            <span ref={hud.bar} />
          </div>
          <div className={s.hudPct}>
            <span ref={hud.pct}>000</span>%
          </div>
        </aside>

        <div className={s.cue} data-cue>
          <span>{model.cue}</span>
          <Dots pulse style={{ ["--dot" as string]: "6px", ["--dot-gap" as string]: "5px" }} />
        </div>
      </div>
    </section>
  );
}
