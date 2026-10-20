import type { CmsService } from "@/core/content/types";

/**
 * A capability card. Same shape as the CMS `Service`, so CMS content drops in
 * as-is; locally `imageUrl` may be a path under /public.
 */
export type Service = CmsService;
export type ServiceStatus = Service["status"];

/** Which procedural model prints for a service in the 3D sequence. */
export type ModelKind = "design" | "maquette" | "prototype" | "printing" | "batch" | "pcb" | "generic";

/** Match by slug first, then by keywords — so CMS-added services still get a sensible model. */
export function modelKindFor(sv: Pick<Service, "slug" | "title">): ModelKind {
  const key = `${sv.slug} ${sv.title}`.toLowerCase();
  if (/pcb|electron|circuit/.test(key)) return "pcb";
  if (/batch|manufactur|production/.test(key)) return "batch";
  if (/3d|print|additive/.test(key)) return "printing";
  if (/maquette|architect|model/.test(key)) return "maquette";
  if (/prototyp/.test(key)) return "prototype";
  if (/design|engineer|cad/.test(key)) return "design";
  return "generic";
}

const service = (s: Omit<Service, "id" | "sortOrder">, sortOrder: number): Service => ({ ...s, id: s.slug, sortOrder });

export const capabilitiesModel = {
  index: "04",
  label: "Capabilities",
  title: "Six ways to make it [[real]].",
  intro: "One team from the first sketch to the first batch. Scroll — each service builds its own model, layer by layer.",
  comingSoon: "Coming soon",
  cta: "Start a project",
  status: { building: "Building", ready: "Ready", soon: "In development" },
  services: [
    service(
      {
        slug: "design-engineering",
        number: "01",
        kicker: "Design",
        title: "Design & Engineering",
        summary: "CAD, detailing and engineering that make an idea buildable before anything is made.",
        description:
          "We optimise the idea for making — geometry, material selection, structural integrity, tolerances and detailing — so the first physical version is already close to right.",
        tags: ["CAD & detailing", "Material selection", "Design for manufacture"],
        status: "available",
        imageUrl: "/images/services/consultation.webp",
      },
      1,
    ),
    service(
      {
        slug: "architectural-maquettes",
        number: "02",
        kicker: "Architecture",
        title: "Architectural Maquettes",
        summary: "Scale models of masterplans, buildings and interiors for reviews, sales and exhibitions.",
        description:
          "Masterplans, towers, villas and interiors at scale — with landscaping, lighting and fine façade detail that make a project readable at a glance.",
        tags: ["Masterplans", "Interiors", "Display models"],
        status: "available",
        imageUrl: "/images/works/compound-2.webp",
      },
      2,
    ),
    service(
      {
        slug: "prototyping",
        number: "03",
        kicker: "Prototype",
        title: "Prototyping",
        summary: "Looks-like and works-like prototypes, refined through as many iterations as it takes.",
        description:
          "From paper concepts to functional prototypes you can test, show to investors and put in users’ hands — revised until it is exactly right.",
        tags: ["Concept models", "Fit & function", "Iterations"],
        status: "available",
        imageUrl: "/images/services/prototyping.webp",
      },
      3,
    ),
    service(
      {
        slug: "3d-printing",
        number: "04",
        kicker: "Additive",
        title: "3D Printing",
        summary: "Detailed parts in plastics, resins and metals — from one-off pieces to fine display work.",
        description:
          "Advanced 3D printing for detailed models and functional parts, chosen per job for surface quality, strength and finish.",
        tags: ["Plastics", "Resins", "Metals"],
        status: "available",
        imageUrl: "/images/works/azadi-1.webp",
      },
      4,
    ),
    service(
      {
        slug: "small-batch-manufacturing",
        number: "05",
        kicker: "Production",
        title: "Small-batch Manufacturing",
        summary: "Short production runs of parts, enclosures and products — finished and ready to use.",
        description:
          "When one is not enough: repeatable short runs of housings, grips and custom parts, finished and checked so every piece matches the approved prototype.",
        tags: ["Short runs", "Enclosures", "Finishing"],
        status: "available",
        imageUrl: "/images/works/handle.webp",
      },
      5,
    ),
    service(
      {
        slug: "pcb-design",
        number: "06",
        kicker: "Electronics",
        title: "PCB Design",
        summary: "Schematics and board layout for the electronics inside your product.",
        description:
          "Soon we will design the boards too — schematics, layout and prototype boards that fit the enclosures we already build.",
        tags: ["Schematics", "Layout", "Prototype boards"],
        status: "comingSoon",
        imageUrl: null,
      },
      6,
    ),
  ] satisfies Service[],
};

export type CapabilitiesModel = typeof capabilitiesModel;
