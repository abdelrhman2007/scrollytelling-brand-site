import type { CmsProject } from "@/core/content/types";
import { projectsFromCms, type Project } from "@/core/content/projects";

/** CMS projects → gallery cases. Null keeps the local projects. */
export function galleryFromCms(list?: CmsProject[] | null): Project[] | null {
  return projectsFromCms(list);
}
