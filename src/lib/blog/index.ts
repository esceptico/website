import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import type { BlogPost, BlogMeta } from './types';
import { isAnnotatedPython } from './parse';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

// Average reading speed (words per minute)
const WORDS_PER_MINUTE = 200;

/**
 * Count words in content, excluding code blocks and frontmatter
 */
function countWords(content: string): number {
  // Remove code blocks
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]+`/g, '');
  // Remove MDX components
  const withoutComponents = withoutInlineCode.replace(/<[^>]+>/g, '');
  // Remove markdown syntax
  const plainText = withoutComponents
    .replace(/[#*_\[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

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
    if (match[1] && isAnnotatedPython(match[1])) return true;
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
  const wordCount = countWords(content);
  const readingTime = calculateReadingTime(wordCount);
  
  return {
    slug,
    title: data.title || slug,
    summary: data.summary,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : undefined,
    tags: data.tags,
    content,
    hasAnnotatedCode,
    readingTime,
    wordCount,
    draft: data.draft === true ? true : undefined
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
    .filter(p => !p.draft)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      date: p.date,
      tags: p.tags,
      hasAnnotatedCode: p.hasAnnotatedCode,
      readingTime: p.readingTime,
      wordCount: p.wordCount
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
