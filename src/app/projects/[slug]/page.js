import { getProjectBySlug, getRelatedProjects, getPublishedProjects } from "@/lib/projectsRepo";
import ProjectPageClient from "./ProjectPageClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let project = null;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    project = null;
  }
  if (!project || project.draft || project.archived) return {};

  // Public-facing title is location-based, not the real project name — same
  // masking rule as the client-rendered pages (ProjectPageClient.js / ProjectDirectory.js).
  const locationLabel = project.location_ar || project.location_en || "";
  const title = locationLabel ? `مشروع ${locationLabel}` : slug;
  const description = (project.seoDescription || project.shortDesc_ar || project.desc_ar || "").slice(0, 160);

  return {
    title: `${title} – MAN`,
    description,
    keywords: project.keywords?.length ? project.keywords.join(", ") : undefined,
    openGraph: {
      title: `${title} – MAN`,
      description,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;

  let project = null;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    project = null;
  }
  if (!project || project.draft || project.archived) notFound();

  let related = [];
  try {
    related = await getRelatedProjects(project.category, slug, 3);
  } catch {
    related = [];
  }

  return <ProjectPageClient project={project} related={related} />;
}
