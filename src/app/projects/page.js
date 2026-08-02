import { getPublishedProjects, toLegacyProjectShape } from "@/lib/projectsRepo";
import { PROJECT_CATEGORIES } from "@/lib/projectCategories";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
  const raw = await getPublishedProjects();
  const projects = raw.map(toLegacyProjectShape);
  return <ProjectsPageClient projects={projects} categories={PROJECT_CATEGORIES} />;
}
