import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCard } from "@/core/content/cms";
import { PageReady } from "@/core/providers/PageReady";
import { ContactCard, cardView } from "@/modules/contact-card";

/**
 * Contact card at a root address chosen in the CMS (/qr, /alex, or a
 * random code). Real pages (/about, /works) always win: Next.js matches
 * static routes before this dynamic one, and the CMS refuses reserved names.
 * Never linked, never in the sitemap, never indexed (see also X-Robots-Tag in
 * next.config.ts), always fetched fresh so a deactivated card stops at once.
 * Unknown addresses fall through to the normal 404 page.
 */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const PRIVATE = { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const card = await getCard((await params).slug);
  if (!card) return { title: "Not found", robots: PRIVATE };
  const role = [card.jobTitle, card.company].filter(Boolean).join(" · ");
  return {
    title: card.name,
    description: role || "Contact card",
    robots: PRIVATE,
    referrer: "no-referrer",
    // Rich preview when the link is shared in a chat, still noindex.
    openGraph: {
      title: card.name,
      description: role || "Contact card",
      images: card.photoUrl ? [{ url: card.photoUrl, alt: card.name }] : undefined,
      type: "profile",
    },
  };
}

export default async function CardPage({ params }: Props) {
  const card = await getCard((await params).slug);
  if (!card) notFound();

  return (
    <>
      <PageReady />
      <ContactCard card={cardView(card)} />
    </>
  );
}
