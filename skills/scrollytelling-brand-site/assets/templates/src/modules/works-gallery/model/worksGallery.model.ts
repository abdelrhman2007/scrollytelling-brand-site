import { localProjects } from "@/core/content/projects";

export const worksGalleryModel = {
  /** Counter prefix on each case ("05.01 / 09"), as on the home page. */
  sectionIndex: "05",
  filterLabel: "Filter projects by discipline",
  allLabel: "All",
  linkLabel: "View project",
  empty: "No projects in this discipline yet.",
  projects: localProjects,
};

export type WorksGalleryModel = typeof worksGalleryModel;
