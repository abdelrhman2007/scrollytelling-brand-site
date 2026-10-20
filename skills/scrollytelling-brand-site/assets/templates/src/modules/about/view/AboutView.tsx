"use client";

import Image from "next/image";
import { PixelTag, SectionLabel, SplitWords } from "@/core/ui";
import { useAboutController } from "../controller/useAboutController";
import s from "./About.module.css";

export default function AboutView() {
  const { root, model } = useAboutController();

  return (
    <section id="about" ref={root} className={s.about}>
      <SectionLabel index={model.index}>{model.label}</SectionLabel>

      <p className={s.statement} data-statement>
        <SplitWords text={model.statement} />
      </p>

      <div className={s.grid}>
        <figure className={s.media} data-about-media data-cursor="Demo">
          <Image src={model.image.src} alt={model.image.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
          <figcaption className={s.caption}>
            <PixelTag>{model.image.caption}</PixelTag>
          </figcaption>
        </figure>

        <div className={s.copy} data-about-copy>
          {model.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <ul className={s.facts}>
        {model.facts.map((f) => (
          <li key={f.label} className={s.fact} data-fact>
            <span className={s.factValue}>{f.value}</span>
            <span className={s.factLabel}>{f.label}</span>
            <span className={s.factDetail}>{f.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
