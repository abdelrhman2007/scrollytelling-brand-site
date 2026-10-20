import type { CmsCard } from "@/core/content/types";
import { intlPhone } from "@/core/content/vcard";

export type CardAction = {
  id: "call" | "whatsapp" | "email" | "website" | "map";
  label: string;
  detail: string;
  href: string;
  external?: boolean;
};

export type CardSocial = { id: string; label: string; href: string };

export const contactCardModel = {
  save: "Save contact",
  share: "Share card",
  copied: "Link copied",
  visit: "Visit demo website",
  brandLine: "The House of Prototyping",
};

/** CMS card → what the view renders (only the channels that exist). */
export function cardView(card: CmsCard) {
  const actions: CardAction[] = [];
  if (card.phone) actions.push({ id: "call", label: "Call", detail: card.phone, href: `tel:${intlPhone(card.phone)}` });
  if (card.whatsapp)
    actions.push({ id: "whatsapp", label: "WhatsApp", detail: `+${card.whatsapp}`, href: `https://wa.me/${card.whatsapp}`, external: true });
  if (card.email) actions.push({ id: "email", label: "Email", detail: card.email, href: `mailto:${card.email}` });
  if (card.website)
    actions.push({ id: "website", label: "Website", detail: card.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), href: card.website, external: true });
  if (card.address)
    actions.push({
      id: "map",
      label: "Location",
      detail: card.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(card.address)}`,
      external: true,
    });

  const socials: CardSocial[] = (
    [
      ["linkedin", "LinkedIn", card.socials?.linkedin],
      ["instagram", "Instagram", card.socials?.instagram],
      ["facebook", "Facebook", card.socials?.facebook],
    ] as const
  )
    .filter(([, , href]) => !!href)
    .map(([id, label, href]) => ({ id, label, href: href! }));

  const initials = card.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return {
    ...card,
    role: [card.jobTitle, card.company].filter(Boolean).join(" · "),
    initials,
    actions,
    socials,
    vcardHref: `/${card.slug}/vcard`,
    ...contactCardModel,
  };
}

export type ContactCardView = ReturnType<typeof cardView>;
