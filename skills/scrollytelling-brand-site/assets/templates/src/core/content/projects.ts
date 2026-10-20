/**
 * Shared project contract. Projects appear in three places (home teaser,
 * /works gallery, /works/[slug] detail), so the type, the local catalogue and
 * the CMS mapper live in the core instead of inside one module.
 *
 * `id` doubles as the URL slug: CMS projects use their `slug`, local projects
 * use a slug-shaped id.
 */
import type { CmsProject } from "./types";

/**
 * Each effect is a different scroll "camera move" for the case-study stage:
 *  zoom  — drone descent onto a masterplan
 *  light — daylight sweeping through mashrabiya
 *  turn  — turntable between two angles of an object
 *  wipe  — the plan rises into the finished model
 *  pan   — slow dolly across a wide industrial scene
 *  stack — exploded view: photos fan out like parts
 */
export type ProjectEffect = "zoom" | "light" | "turn" | "wipe" | "pan" | "stack";

export type ProjectImage = { src: string; alt: string };

export type ProjectDiscipline =
  | "Architecture"
  | "3D Printing"
  | "Product"
  | "Industrial"
  | "Heritage"
  | "Manufacturing"
  | "Electronics";

/** Filter order on /works. */
export const disciplineOrder: ProjectDiscipline[] = [
  "Architecture",
  "3D Printing",
  "Product",
  "Industrial",
  "Heritage",
  "Manufacturing",
  "Electronics",
];

export type Project = {
  /** URL slug — `/works/<id>`. */
  id: string;
  title: string;
  category: string;
  discipline: ProjectDiscipline;
  summary: string;
  effect: ProjectEffect;
  theme?: "navy" | "paper" | "yellow";
  images: ProjectImage[];
  highlights: string[];
  featured?: boolean;
};

const img = (file: string, alt: string) => ({ src: `/images/works/${file}.webp`, alt });

/** Local catalogue — used whenever the CMS is off or has no projects. */
export const localProjects: Project[] = [
  {
    id: "residential-compound",
    title: "Residential Compound",
    category: "Architectural maquette",
    discipline: "Architecture",
    effect: "zoom",
    summary:
      "A complete residential masterplan at scale — apartment blocks, landscaping, roads and street lighting — so buyers and investors can read the whole community at a glance.",
    highlights: ["Masterplan", "Landscaping", "Street furniture"],
    images: [
      img("compound-2", "Aerial view of a residential compound maquette"),
      img("compound-1", "Compound maquette with apartment blocks and a central building"),
      img("compound-3", "Close-up of yellow apartment blocks with palm trees"),
      img("compound-4", "Top-down view of the compound road network"),
    ],
  },
  {
    id: "mosque-interior",
    title: "Mosque Interior",
    category: "Interior maquette",
    discipline: "Architecture",
    effect: "light",
    summary:
      "Fine mashrabiya screens, arched windows and patterned floors — an interior model detailed enough to study light and space before construction begins.",
    highlights: ["Laser-cut mashrabiya", "Interior lighting", "Pattern detailing"],
    images: [
      img("mosque-2", "Mosque interior maquette with light through mashrabiya arches"),
      img("mosque-3", "Mosque entrance with lattice doors and steps"),
      img("mosque-1", "Patterned floor and doors in the mosque maquette"),
      img("mosque-4", "Mosque interior with calligraphy frieze"),
    ],
  },
  {
    id: "azadi-tower",
    title: "Azadi Tower",
    category: "3D printed landmark",
    discipline: "3D Printing",
    effect: "turn",
    theme: "paper",
    summary:
      "A landmark study printed as one sculptural piece — sweeping curves, ribbed surfaces and a pointed arch, reproduced with clean layer work.",
    highlights: ["Single-piece print", "Curved geometry", "Fine ribbing"],
    images: [
      img("azadi-1", "3D printed Azadi Tower model, three-quarter view"),
      img("azadi-2", "3D printed Azadi Tower model, front view"),
    ],
  },
  {
    id: "private-villa",
    title: "Private Villa",
    category: "Architectural maquette",
    discipline: "Architecture",
    effect: "wipe",
    summary:
      "From roof plan to finished model: a white villa with domed tower, pergolas and garden — showing massing, openings and landscape in one object.",
    highlights: ["Plan to model", "Pergola detailing", "Landscape"],
    images: [
      img("villa-plan", "Top view of the villa maquette roof plan"),
      img("villa-1", "Villa maquette with conical tower and palm trees"),
      img("villa-2", "Villa maquette entrance with glass pyramid roof"),
      img("villa-3", "Villa maquette front garden"),
    ],
  },
  {
    id: "sugar-factory",
    title: "Sugar Factory",
    category: "Industrial maquette",
    discipline: "Industrial",
    effect: "pan",
    summary:
      "A large industrial plant modelled in steel-frame detail — conveyors, truss structures and site buildings — to explain a complex operation simply.",
    highlights: ["Truss structures", "Site logistics", "Large format"],
    images: [
      img("factory-1", "Sugar factory maquette with conveyor and steel truss structure"),
      img("factory-2", "Sugar factory maquette site with buildings and vehicles"),
    ],
  },
  {
    id: "commercial-building",
    title: "Commercial Building",
    category: "Architectural maquette",
    discipline: "Architecture",
    effect: "zoom",
    summary:
      "Curtain-wall façades, a rooftop pool deck and street-level retail — a commercial project shown at a scale where materials and details read clearly.",
    highlights: ["Glass façades", "Roof terrace", "Streetscape"],
    images: [
      img("commercial-2", "Commercial building maquette with green terraces and roof pool"),
      img("commercial-1", "Street-level façade of the commercial building maquette"),
    ],
  },
  {
    id: "wekalet-el-ghoury",
    title: "Wekalet El Ghoury",
    category: "Heritage study model",
    discipline: "Heritage",
    effect: "stack",
    summary:
      "A courtyard model of the historic Mamluk-era caravanserai in Islamic Cairo, built for an academic study of passive ventilation and daylight.",
    highlights: ["Academic", "Heritage", "Courtyard study"],
    images: [
      img("ghoury-2", "Courtyard model of Wekalet El Ghoury from above"),
      img("ghoury-1", "Wekalet El Ghoury model with research poster"),
    ],
  },
  {
    id: "ecu-soft-enclosure",
    title: "ECU Soft Enclosure",
    category: "Product · 3D printing",
    discipline: "Product",
    effect: "stack",
    theme: "yellow",
    summary:
      "A custom 3D printed enclosure for an electronics device — embossed labels, display window and button layout, ready for real-world use.",
    highlights: ["Functional part", "Embossed labelling", "Electronics housing"],
    images: [
      img("ecu-1", "Grey 3D printed ECU Soft enclosure with red buttons"),
      img("ecu-2", "ECU Soft enclosure side view"),
      img("ecu-3", "ECU Soft enclosure with loose buttons"),
    ],
  },
  {
    id: "custom-parts",
    title: "Custom Parts",
    category: "Product · 3D printing",
    discipline: "Product",
    effect: "turn",
    theme: "paper",
    summary:
      "Branded device housings and ergonomic textured handles — functional parts printed to fit, feel and perform.",
    highlights: ["Housings", "Textured grips", "Fit & function"],
    images: [
      img("limitless", "Black 3D printed enclosure embossed with Limitless"),
      img("handle", "Textured ergonomic 3D printed handles beside a filament spool"),
    ],
  },
];

/**
 * One CMS project → one project. Image URLs arrive absolute from the CMS.
 * A project without images can't drive any stage effect, so it is skipped.
 */
export function projectFromCms(p: CmsProject): Project | null {
  const images = p.images.filter((im) => !!im.url).map((im) => ({ src: im.url, alt: im.alt || p.title }));
  if (!images.length) return null;
  return {
    id: p.slug || p.id,
    title: p.title,
    category: p.category,
    discipline: p.discipline,
    summary: p.summary,
    effect: p.effect,
    theme: p.theme,
    images,
    highlights: p.highlights,
    featured: p.featured,
  };
}

/** CMS projects → projects, in CMS order. Null (none usable) keeps the local ones. */
export function projectsFromCms(list?: CmsProject[] | null): Project[] | null {
  if (!list?.length) return null;
  const projects = [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(projectFromCms)
    .filter((p): p is Project => p !== null);
  return projects.length ? projects : null;
}

/** The list every page should show: CMS first, local catalogue as fallback. */
export function resolveProjects(list?: CmsProject[] | null): Project[] {
  return projectsFromCms(list) ?? localProjects;
}

/** Featured projects first (CMS flag), topped up in list order. */
export function pickFeatured(projects: Project[], count = 3): Project[] {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, count);
}
