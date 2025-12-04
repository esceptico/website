import { getDocBySlug, getAllDocs } from '@/lib/docs';
import { DocViewer } from '@/components/docs';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map(doc => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  
  if (!doc) {
    return { title: 'Not Found' };
  }

  return {
    title: `${doc.title || doc.filename} | Timur Ganiev`,
    description: `Annotated implementation of ${doc.title || doc.filename}`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return <DocViewer document={doc} />;
}

