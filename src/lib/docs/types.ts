/**
 * A chunk represents a paired documentation + code segment
 */
export interface Chunk {
  /** The documentation/annotation text (markdown) */
  doc: string
  /** The code lines for this chunk */
  code: string
  /** Starting line number in the original file */
  lineStart: number
  /** Ending line number in the original file */
  lineEnd: number
  /** Whether this is a section header (## style) */
  isHeader?: boolean
}

/**
 * Parsed document containing all chunks
 */
export interface ParsedDocument {
  /** Original filename */
  filename: string
  /** Detected language for syntax highlighting */
  language: string
  /** All parsed chunks */
  chunks: Chunk[]
  /** Document title (from first # header if present) */
  title?: string
  /** Document summary/description */
  summary?: string
  /** Document date */
  date?: string
}

/**
 * Document metadata for the index page
 */
export interface DocMeta {
  slug: string
  title: string
  description?: string
  language: string
  date?: string
  tags?: string[]
}

/**
 * Comment style configuration for different languages
 */
export interface CommentStyle {
  single: string      // e.g., '//' or '#'
  multiStart?: string // e.g., '/*'
  multiEnd?: string   // e.g., '*/'
}

