/**
 * Contact-card addresses live at the site root (/qr, /alex, /k7qx2mpa9rbn).
 * Keep in sync with ReservedPaths in the CMS (ContactCardModelValidator).
 */
export const CARD_SLUG = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/;

export const RESERVED_PATHS = new Set([
  "about", "works", "projects", "contact", "services", "team", "c", "api", "admin", "login", "logout",
  "images", "models", "uploads", "static", "assets", "public", "next", "_next",
  "sitemap", "robots", "icon", "apple-icon", "favicon", "opengraph-image", "manifest", "not-found", "404", "500",
]);

export const isCardSlug = (slug: string) => CARD_SLUG.test(slug) && !RESERVED_PATHS.has(slug);
