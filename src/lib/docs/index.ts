import { parse } from './parser';
import type { DocMeta, ParsedDocument } from './types';
import { ropeContent } from '@/content/docs/rope';

interface DocEntry {
  slug: string;
  content: string;
  meta: Omit<DocMeta, 'slug' | 'language'>;
}

const docs: DocEntry[] = [
  {
    slug: 'rope',
    content: ropeContent,
    meta: {
      title: 'Rotary Position Embeddings (RoPE)',
      description: 'Position encoding via rotation — the method behind LLaMA, Qwen, and Mistral',
      date: '2025-12-04',
    },
  },
];

export function getAllDocs(): DocMeta[] {
  return docs.map(doc => {
    const parsed = parse(doc.content, 'code.py');
    return {
      slug: doc.slug,
      title: doc.meta.title || parsed.title || doc.slug,
      description: doc.meta.description,
      language: parsed.language,
      date: doc.meta.date,
    };
  });
}

export function getDocBySlug(slug: string): ParsedDocument | null {
  const doc = docs.find(d => d.slug === slug);
  if (!doc) return null;
  
  return parse(doc.content, 'code.py');
}

export function getDocMeta(slug: string): DocMeta | null {
  const doc = docs.find(d => d.slug === slug);
  if (!doc) return null;
  
  const parsed = parse(doc.content, 'code.py');
  return {
    slug: doc.slug,
    title: doc.meta.title || parsed.title || doc.slug,
    description: doc.meta.description,
    language: parsed.language,
    date: doc.meta.date,
  };
}

export { parse } from './parser';
export type { Chunk, ParsedDocument, DocMeta } from './types';
