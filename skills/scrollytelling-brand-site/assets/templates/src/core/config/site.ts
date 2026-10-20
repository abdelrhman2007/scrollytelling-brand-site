/**
 * Site-wide navigation map. Every top-level module registers its anchor here,
 * so the shell (menu, progress rail) never needs to know about module internals.
 */
export type SiteSection = {
  id: string;
  label: string;
  index: string;
};

export const siteSections: SiteSection[] = [
  { id: "top", label: "Prototype", index: "00" },
  { id: "about", label: "Demo profile", index: "01" },
  { id: "mission", label: "Mission & vision", index: "02" },
  { id: "services", label: "How we work", index: "03" },
  { id: "capabilities", label: "Capabilities", index: "04" },
  { id: "works", label: "Projects", index: "05" },
  { id: "industries", label: "Industries", index: "06" },
  { id: "team", label: "Team", index: "07" },
  { id: "contact", label: "Contacts", index: "08" },
];

/**
 * Top-level pages. Home is the scroll story; the others are regular pages that
 * share the shell. `match` decides when a page link is shown as active.
 */
export type SitePage = {
  href: string;
  label: string;
  index: string;
  /** Path prefix that marks this page as current (null: never "active"). */
  match: string | null;
};

export const sitePages: SitePage[] = [
  { href: "/", label: "Home", index: "00", match: "/" },
  { href: "/about", label: "About Demo", index: "01", match: "/about" },
  { href: "/works", label: "Projects", index: "02", match: "/works" },
  { href: "/#contact", label: "Contact", index: "03", match: null },
];

/** Is `href`'s page the current one? Prefix match, except Home which is exact. */
export function isCurrentPage(page: SitePage, pathname: string) {
  if (!page.match) return false;
  if (page.match === "/") return pathname === "/";
  return pathname === page.match || pathname.startsWith(`${page.match}/`);
}

export const site = {
  url: "https://example.com",
  title: "Demo — The House of Prototyping",
  description:
    "Demo turns ideas into real products. Design & engineering, architectural maquettes, prototyping, 3D printing and small-batch manufacturing — with PCB design coming soon — by a team of designers and engineers in Egypt.",
};
