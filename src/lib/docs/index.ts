import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import type { DocMeta, ParsedDocument, Chunk } from './types';

/**
 * Parse annotated Python files (labml-style)
 * 
 * Simple rules:
 * 1. Module docstring with frontmatter → intro
 * 2. # comments → doc for following code
 * 3. Everything else → code
 */

function parse(source: string, filename: string): { doc: ParsedDocument; meta: { title?: string; summary?: string } } {
  const lines = source.split('\n');
  const chunks: Chunk[] = [];
  let i = 0;
  let meta: { title?: string; summary?: string } = {};

  // Skip leading empty lines
  while (i < lines.length && !lines[i].trim()) i++;

  // 1. Parse module docstring (intro)
  if (lines[i]?.trim().startsWith('"""') || lines[i]?.trim().startsWith("'''")) {
    const delim = lines[i].trim().slice(0, 3);
    i++; // skip opening """
    
    const docLines: string[] = [];
    while (i < lines.length && !lines[i].includes(delim)) {
      docLines.push(lines[i]);
      i++;
    }
    i++; // skip closing """
    
    const { data, content } = matter(docLines.join('\n').trim());
    meta = { title: data.title, summary: data.summary };
    
    if (content.trim()) {
      chunks.push({ doc: content.trim(), code: '', lineStart: 1, lineEnd: i, isHeader: true });
    }
  }

  // 2. Parse rest: comments → doc, everything else → code
  let doc: string[] = [];
  let code: string[] = [];

  function flush() {
    const d = doc.join('\n').trim();
    const c = code.join('\n').replace(/^\n+|\n+$/g, '');
    
    if (!d && c && chunks.length > 0) {
      // Undocumented code → append to previous
      const prev = chunks[chunks.length - 1];
      prev.code = prev.code ? prev.code + '\n\n' + c : c;
    } else if (d || c) {
      chunks.push({ doc: d, code: c, lineStart: 1, lineEnd: 1, isHeader: d.startsWith('## ') });
    }
    
    doc = [];
    code = [];
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Comment → doc (except shebang)
    if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) {
      if (code.some(l => l.trim())) flush();
      doc.push(trimmed.slice(1).trimStart()); // remove # and leading space
      i++;
      continue;
    }

    // Everything else → code
    code.push(line);
    i++;
  }
  
  flush();

  return { doc: { filename, language: 'python', chunks, title: meta.title }, meta };
}

// File loading
const DOCS_DIR = path.join(process.cwd(), 'src/content/docs');

function loadDocs(): Map<string, { document: ParsedDocument; meta: DocMeta }> {
  const cache = new Map<string, { document: ParsedDocument; meta: DocMeta }>();
  try {
    for (const file of fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.py'))) {
      const slug = file.replace('.py', '');
      const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
      const { doc, meta } = parse(content, file);
      cache.set(slug, {
        document: doc,
        meta: { slug, title: meta.title || slug, description: meta.summary || '', language: 'python' },
      });
    }
  } catch (e) {
    console.error('Error loading docs:', e);
  }
  return cache;
}

let cache: Map<string, { document: ParsedDocument; meta: DocMeta }> | null = null;
function getCache() {
  if (process.env.NODE_ENV === 'development' || !cache) cache = loadDocs();
  return cache;
}

export const getAllDocs = () => Array.from(getCache().values()).map(d => d.meta);
export const getDocBySlug = (slug: string) => getCache().get(slug)?.document || null;
export const getDocMeta = (slug: string) => getCache().get(slug)?.meta || null;

export type { Chunk, ParsedDocument, DocMeta } from './types';
