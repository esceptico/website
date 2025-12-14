/**
 * A chunk represents either prose or a paired documentation + code segment
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
 * Parsed blog post containing all chunks
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
  /** All parsed chunks */
  chunks: Chunk[]
  /** Whether this post contains any code */
  hasCode: boolean
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
  hasCode: boolean
}
