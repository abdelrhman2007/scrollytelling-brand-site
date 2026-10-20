import type { CmsService } from "@/core/content/types";
import type { Service } from "./capabilities.model";

/** CMS services → capability cards (same shape, sorted). Null keeps the local list. */
export function servicesFromCms(list?: CmsService[] | null): Service[] | null {
  if (!list?.length) return null;
  return [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((sv, i) => ({ ...sv, number: sv.number || String(i + 1).padStart(2, "0"), tags: sv.tags ?? [] }));
}
