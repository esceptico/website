/**
 * A chunk represents either prose or a paired documentation + code segment
 * Used for the AnnotatedCode component
 */
export interface Chunk {
  /** The documentation/annotation text (markdown) */
  doc: string
  /** The code lines for this chunk (empty for prose-only chunks) */
  code: string
  /** Whether this is a section header (## style) */
  isHeader?: boolean
}

/**
 * Parsed blog post with MDX content
 */
export interface BlogPost {
  /** URL slug */
  slug: string
  /** Post title */
  title: string
  /** Post summary/description */
  summary?: string
  /** Publication date */
  date?: string
  /** Tags for categorization */
  tags?: string[]
  /** Raw MDX content for rendering */
  content: string
  /** Whether this post contains annotated code blocks */
  hasAnnotatedCode: boolean
}

/**
 * Post metadata for the index page
 */
export interface BlogMeta {
  slug: string
  title: string
  summary?: string
  date?: string
  tags?: string[]
  hasAnnotatedCode: boolean
}
