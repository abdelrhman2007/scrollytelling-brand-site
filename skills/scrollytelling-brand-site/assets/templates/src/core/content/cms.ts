import type { CmsCard, CmsContent } from "./types";
import { isCardSlug } from "./cards";

/**
 * Server-only CMS client. Reads the private `CMS_URL` (never exposed to the
 * browser) and returns `null` on any failure — callers then fall back to the
 * content baked into each module's model, so the site renders without a CMS.
 */
const TIMEOUT_MS = 3000;

export const cmsBaseUrl = () => process.env.CMS_URL?.trim().replace(/\/+$/, "") || null;

export async function getContent(): Promise<CmsContent | null> {
  if (typeof window !== "undefined") return null; // never from the client bundle
  const base = cmsBaseUrl();
  if (!base) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/v1/content`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isContent(data) ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Shallow shape check — enough to never hand a module something unexpected. */
function isContent(d: unknown): d is CmsContent {
  if (!d || typeof d !== "object") return false;
  const c = d as Record<string, unknown>;
  return (
    !!c.settings &&
    typeof c.settings === "object" &&
    ["services", "projects", "industries", "team"].every((k) => Array.isArray(c[k]))
  );
}


/**
 * One private contact card by its exact slug. Never cached: deactivating a
 * card in the CMS must take effect on the next scan. Null = not found / CMS down.
 */
export async function getCard(slug: string): Promise<CmsCard | null> {
  if (typeof window !== "undefined") return null;
  const base = cmsBaseUrl();
  if (!base || !isCardSlug(slug)) return null; // rejected before it reaches the CMS

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/v1/cards/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<CmsCard> | null;
    return data && typeof data.name === "string" && data.slug === slug ? (data as CmsCard) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
