import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import type { BlogPost, BlogMeta } from './types';
import { isAnnotatedPython } from './parse';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

/**
 * Check if content contains annotated Python code blocks
 */
function hasAnnotatedCodeBlocks(content: string): boolean {
  // Check for explicit AnnotatedCode component
  if (content.includes('<AnnotatedCode')) return true;
  
  // Check for annotated Python in fenced code blocks
  const codeBlockRegex = /```(?:python|py)\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (isAnnotatedPython(match[1])) return true;
  }
  return false;
}

/**
 * Parse a markdown/MDX file into a BlogPost
 */
function parseFile(filePath: string, slug: string): BlogPost {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  const hasAnnotatedCode = hasAnnotatedCodeBlocks(content);
  
  return {
    slug,
    title: data.title || slug,
    summary: data.summary,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : undefined,
    tags: data.tags,
    content,
    hasAnnotatedCode
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
    
    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
    
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
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
      hasAnnotatedCode: p.hasAnnotatedCode
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
