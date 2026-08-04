import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blogData";
import BlogPostClient from "./BlogPostClient";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title.en,
    description: post.excerpt.en,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostClient post={post} />;
}
