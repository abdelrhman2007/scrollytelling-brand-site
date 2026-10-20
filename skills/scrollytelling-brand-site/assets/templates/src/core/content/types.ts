/**
 * Public content contract of the Demo CMS (v1) — mirrors
 * demo-cms/docs/API.md exactly. All JSON is camelCase, media URLs are absolute.
 */

export type CmsSocials = {
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
};

export type CmsSettings = {
  companyName: string;
  tagline: string;
  email: string | null;
  /** Local format, e.g. "01000000000". */
  phone: string | null;
  /** International digits only, e.g. "201000000000". */
  whatsapp: string | null;
  address: string | null;
  socials: CmsSocials;
};

export type CmsServiceStatus = "available" | "comingSoon";

export type CmsService = {
  id: string;
  slug: string;
  number: string;
  kicker: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  status: CmsServiceStatus;
  imageUrl: string | null;
  sortOrder: number;
};

export type CmsDiscipline =
  | "Architecture"
  | "3D Printing"
  | "Industrial"
  | "Heritage"
  | "Product"
  | "Manufacturing"
  | "Electronics";

export type CmsEffect = "zoom" | "light" | "turn" | "wipe" | "pan" | "stack";

export type CmsTheme = "navy" | "paper" | "yellow";

export type CmsImage = { url: string; alt: string };

export type CmsProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  discipline: CmsDiscipline;
  summary: string;
  effect: CmsEffect;
  theme: CmsTheme;
  highlights: string[];
  images: CmsImage[];
  featured: boolean;
  sortOrder: number;
};

export type CmsIndustry = {
  id: string;
  name: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
};

export type CmsTeamMember = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  photoUrl: string | null;
  sortOrder: number;
};

/** GET /api/v1/content */
export type CmsContent = {
  settings: CmsSettings;
  services: CmsService[];
  projects: CmsProject[];
  industries: CmsIndustry[];
  team: CmsTeamMember[];
};

/** POST /api/v1/contact — request body. */
export type CmsContactRequest = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  projectType: string;
  message: string;
  /** Honeypot — must stay empty. */
  website: string;
};

/** POST /api/v1/contact — 202 Accepted. */
export type CmsContactAccepted = { id: string; message: string };

/** POST /api/v1/contact — 400, RFC 7807 ValidationProblemDetails. */
export type CmsValidationProblem = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
};

/** Private contact card — `GET /api/v1/cards/{slug}` (only by exact slug). */
export type CmsCard = {
  slug: string;
  name: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  /** As entered, usually local format. */
  phone: string | null;
  /** International digits only. */
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  socials: { linkedin: string | null; instagram: string | null; facebook: string | null };
  photoUrl: string | null;
};
