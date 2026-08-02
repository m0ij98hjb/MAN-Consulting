import { SERVICES_SLUGS, SERVICES_DATA } from "@/lib/servicesData";
import ServicePageClient from "./ServicePageClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return SERVICES_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = SERVICES_DATA[slug];
  if (!data) return {};
  const title = data.content.ar?.title || data.content.en?.title || slug;
  return {
    title: `${title} – MNC`,
    description: data.content.ar?.description?.slice(0, 160),
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  if (!SERVICES_DATA[slug]) notFound();
  return <ServicePageClient slug={slug} />;
}
