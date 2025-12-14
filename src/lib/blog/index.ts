import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import type { BlogPost, BlogMeta, Chunk } from './types';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

/**
 * Parse annotated Python code into doc+code chunks
 * 
 * Rules:
 * - Lines starting with # become documentation
 * - Everything else is code
 * - ## headers in comments mark section boundaries
 */
function parseAnnotatedCode(code: string): Chunk[] {
  const lines = code.split('\n');
  const chunks: Chunk[] = [];
  let i = 0;

  let doc: string[] = [];
  let codeLines: string[] = [];

  function flush() {
    const d = doc.join('\n').trim();
    const c = codeLines.join('\n').replace(/^\n+|\n+$/g, '');

    const prev = chunks[chunks.length - 1];
    if (!d && c && prev) {
      // Undocumented code → append to previous chunk
      prev.code = prev.code ? prev.code + '\n\n' + c : c;
    } else if (d || c) {
      chunks.push({ 
        doc: d, 
        code: c, 
        isHeader: d.startsWith('## ') || d.startsWith('# ') 
      });
    }

    doc = [];
    codeLines = [];
  }

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Comment → doc (except shebang and empty comments that are just spacing)
    if (trimmed.startsWith('#') && !trimmed.startsWith('#!')) {
      if (codeLines.some(l => l.trim())) flush();
      doc.push(trimmed.slice(1).trimStart()); // remove # and leading space
      i++;
      continue;
    }

    // Everything else → code
    codeLines.push(line);
    i++;
  }

  flush();
  return chunks;
}

/**
 * Check if a code block looks like annotated Python
 * (has comment lines that look like documentation)
 */
function isAnnotatedPython(code: string): boolean {
  const lines = code.split('\n');
  let hasDocComments = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for header-style comments or multi-word comments
    if (trimmed.startsWith('# #') || trimmed.startsWith('## ')) {
      hasDocComments = true;
      break;
    }
    // Or comments with markdown-like content
    if (trimmed.startsWith('#') && trimmed.length > 2) {
      const content = trimmed.slice(1).trim();
      // Check for markdown patterns: headers, emphasis, links, lists
      if (/^#|^\*\*|^\[|^-\s|^\d+\.\s|^\$/.test(content)) {
        hasDocComments = true;
        break;
      }
    }
  }
  
  return hasDocComments;
}

/**
 * Parse markdown content into chunks
 * 
 * - Regular markdown becomes prose chunks (doc only)
 * - Python code blocks with annotations get parsed into doc+code chunks
 * - Regular code blocks stay as-is in prose
 */
function parseMarkdown(content: string): Chunk[] {
  const chunks: Chunk[] = [];
  
  // Split on code fences, keeping the delimiters
  // Match ```python or ```py with optional trailing content
  const parts = content.split(/(```(?:python|py)\n[\s\S]*?\n```)/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Check if this is a Python code block
    const codeMatch = trimmed.match(/^```(?:python|py)\n([\s\S]*)\n```$/);
    
    if (codeMatch) {
      const code = codeMatch[1] ?? '';
      
      // Check if it's annotated Python
      if (isAnnotatedPython(code)) {
        // Parse into doc+code chunks
        const annotatedChunks = parseAnnotatedCode(code);
        chunks.push(...annotatedChunks);
      } else {
        // Regular code block - wrap in a chunk with the code
        chunks.push({
          doc: '',
          code: code,
          isHeader: false
        });
      }
    } else {
      // Regular markdown prose
      chunks.push({
        doc: trimmed,
        code: '',
        isHeader: false
      });
    }
  }
  
  return chunks;
}

/**
 * Parse a markdown file into a BlogPost
 */
function parseFile(filePath: string, slug: string): BlogPost {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  
  const chunks = parseMarkdown(body);
  const hasCode = chunks.some(c => c.code.trim().length > 0);
  
  return {
    slug,
    title: data.title || slug,
    summary: data.summary,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : undefined,
    tags: data.tags,
    chunks,
    hasCode
  };
}

// Cache
let cache: Map<string, BlogPost> | null = null;

function loadPosts(): Map<string, BlogPost> {
  const posts = new Map<string, BlogPost>();
  
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      fs.mkdirSync(BLOG_DIR, { recursive: true });
      return posts;
    }
    
    for (const file of fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))) {
      const slug = file.replace('.md', '');
      const filePath = path.join(BLOG_DIR, file);
      posts.set(slug, parseFile(filePath, slug));
    }
  } catch (e) {
    console.error('Error loading blog posts:', e);
  }
  
  return posts;
}

function getCache(): Map<string, BlogPost> {
  if (process.env.NODE_ENV === 'development' || !cache) {
    cache = loadPosts();
  }
  return cache;
}

// Public API
export function getAllPosts(): BlogMeta[] {
  return Array.from(getCache().values())
    .map(p => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      date: p.date,
      tags: p.tags,
      hasCode: p.hasCode
    }))
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getCache().get(slug) || null;
}

export type { BlogPost, BlogMeta, Chunk } from './types';
