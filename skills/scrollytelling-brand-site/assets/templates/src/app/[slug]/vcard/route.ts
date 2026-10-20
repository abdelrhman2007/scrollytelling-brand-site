import { getCard } from "@/core/content/cms";
import { toVCard } from "@/core/content/vcard";
import { site } from "@/core/config/site";

export const dynamic = "force-dynamic";

/** "Save contact": the card as a .vcf file. Same visibility rules as the page. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCard(slug);
  if (!card) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  const origin = process.env.NODE_ENV === "production" ? site.url : new URL(req.url).origin;
  const file = card.name.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "contact";

  return new Response(toVCard(card, `${origin}/${card.slug}`), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file}.vcf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
