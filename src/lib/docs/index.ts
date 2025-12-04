import { parse } from './parser';
import type { DocMeta, ParsedDocument } from './types';
import { mhaContent } from '@/content/docs/mha';
import { grpoContent } from '@/content/docs/grpo';
import { dpoContent } from '@/content/docs/dpo';
import { samplingContent } from '@/content/docs/sampling';

interface DocEntry {
  slug: string;
  content: string;
  meta: Omit<DocMeta, 'slug' | 'language'>;
}

const docs: DocEntry[] = [
  {
    slug: 'mha',
    content: mhaContent,
    meta: {
      title: 'Attention Mechanisms: MHA, MQA, GQA',
      description: 'Multi-Head, Multi-Query, and Grouped-Query Attention with KV-cache optimizations',
      date: '2024-12-04',
    },
  },
  {
    slug: 'grpo',
    content: grpoContent,
    meta: {
      title: 'Group Relative Policy Optimization',
      description: 'GRPO algorithm for efficient LLM fine-tuning without a critic network',
      date: '2024-12-03',
    },
  },
  {
    slug: 'dpo',
    content: dpoContent,
    meta: {
      title: 'Direct Preference Optimization',
      description: 'Simplifying RLHF by eliminating the reward model with a closed-form solution',
      date: '2024-12-02',
    },
  },
  {
    slug: 'sampling',
    content: samplingContent,
    meta: {
      title: 'Top-k and Top-p Sampling',
      description: 'Decoding strategies for language model text generation',
      date: '2024-12-01',
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
