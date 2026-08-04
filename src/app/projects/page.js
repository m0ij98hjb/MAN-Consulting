import { getPublishedProjects, toLegacyProjectShape } from "@/lib/projectsRepo";
import { PROJECT_CATEGORIES } from "@/lib/projectCategories";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
  let raw = [];
  try {
    raw = await getPublishedProjects();
  } catch {
    raw = [];
  }
  const projects = raw.map(toLegacyProjectShape);
  return <ProjectsPageClient projects={projects} categories={PROJECT_CATEGORIES} />;
}
