"use client";

import Image from "next/image";
import { brand } from "@/core/config/brand";
import { Dots, PixelTag } from "@/core/ui";
import type { ContactCardView as Card } from "../model/contactCard.model";
import { useContactCardController } from "../controller/useContactCardController";
import s from "./ContactCard.module.css";

const ICONS: Record<string, string> = {
  call: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z",
  whatsapp: "M12 2a10 10 0 0 0-8.7 15l-1.3 5 5.1-1.3A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.7-.1 1.3z",
  email: "M4 5h16c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V6c0-.6.4-1 1-1zm8 7.2L4.6 7.5v.1L12 12.4l7.4-4.8v-.1L12 12.2z",
  website: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6C8.9 5.5 8.4 6.7 8.1 8zM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.2 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4h-3.4z",
  map: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
};

export default function ContactCardView({ card }: { card: Card }) {
  const { share, copied } = useContactCardController(card.name);

  return (
    <main id="main" className={`${s.page} blueprint`}>
      <article className={s.card} aria-labelledby="card-name">
        <header className={s.top}>
          <Image src={brand.logo.mark} alt="Demo" width={882} height={331} className={s.logo} priority />
          <Dots />
        </header>

        <div className={s.identity}>
          <div className={s.photo}>
            {card.photoUrl ? (
              <Image src={card.photoUrl} alt={card.name} fill sizes="136px" priority />
            ) : (
              <span aria-hidden>{card.initials}</span>
            )}
          </div>
          <h1 id="card-name" className={s.name}>
            {card.name}
          </h1>
          {card.role && <p className={s.role}>{card.role}</p>}
          {card.bio && <p className={s.bio}>{card.bio}</p>}
        </div>

        <a className={s.save} href={card.vcardHref} download>
          <span>{card.save}</span>
          <span aria-hidden>↓</span>
        </a>

        <ul className={s.actions}>
          {card.actions.map((a) => (
            <li key={a.id}>
              <a
                className={s.action}
                href={a.href}
                {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <svg viewBox="0 0 24 24" aria-hidden className={s.icon}>
                  <path d={ICONS[a.id]} />
                </svg>
                <span className={s.actionText}>
                  <b>{a.label}</b>
                  <small>{a.detail}</small>
                </span>
                <span aria-hidden className={s.arrow}>
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        {card.socials.length > 0 && (
          <ul className={s.socials}>
            {card.socials.map((so) => (
              <li key={so.id}>
                <a href={so.href} target="_blank" rel="noopener noreferrer">
                  {so.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}

        <footer className={s.foot}>
          <button type="button" className={s.share} onClick={share}>
            {copied ? card.copied : card.share}
          </button>
          <a className={s.visit} href="/">
            <PixelTag tone="ghost">{card.brandLine}</PixelTag>
            <span>{card.visit} →</span>
          </a>
        </footer>
      </article>
    </main>
  );
}
