import type { Chunk, ParsedDocument, CommentStyle } from './types'

/**
 * Comment styles for different languages
 */
const COMMENT_STYLES: Record<string, CommentStyle> = {
  python: { single: '#' },
  javascript: { single: '//', multiStart: '/*', multiEnd: '*/' },
  typescript: { single: '//', multiStart: '/*', multiEnd: '*/' },
  rust: { single: '//', multiStart: '/*', multiEnd: '*/' },
  go: { single: '//', multiStart: '/*', multiEnd: '*/' },
  c: { single: '//', multiStart: '/*', multiEnd: '*/' },
  cpp: { single: '//', multiStart: '/*', multiEnd: '*/' },
  java: { single: '//', multiStart: '/*', multiEnd: '*/' },
  ruby: { single: '#' },
  shell: { single: '#' },
  bash: { single: '#' },
}

/**
 * Detect language from filename extension
 */
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    rs: 'rust',
    go: 'go',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    hpp: 'cpp',
    java: 'java',
    rb: 'ruby',
    sh: 'shell',
    bash: 'bash',
  }
  return langMap[ext] || 'python'
}

/**
 * Check if a line is a documentation comment
 */
function isDocComment(line: string, commentStyle: CommentStyle): boolean {
  const trimmed = line.trim()
  const marker = commentStyle.single
  
  if (trimmed === marker) return true
  if (trimmed.startsWith(marker + ' ')) return true
  
  return false
}

/**
 * Extract documentation content from a doc comment line
 */
function extractDocContent(line: string, commentStyle: CommentStyle): string {
  const trimmed = line.trim()
  const marker = commentStyle.single
  
  if (trimmed === marker) return ''
  
  return trimmed.slice(marker.length + 1)
}

/**
 * Parse an annotated source file into chunks
 */
export function parse(source: string, filename: string): ParsedDocument {
  const language = detectLanguage(filename)
  const commentStyle = COMMENT_STYLES[language] || { single: '#' }
  
  const lines = source.split('\n')
  const chunks: Chunk[] = []
  
  let currentDoc: string[] = []
  let currentCode: string[] = []
  let codeStartLine = 1
  let title: string | undefined
  
  function flushChunk() {
    if (currentDoc.length > 0 || currentCode.length > 0) {
      const doc = currentDoc.join('\n').trim()
      const code = currentCode.join('\n')
      
      if (!title && doc.startsWith('# ')) {
        const firstLine = doc.split('\n')[0]
        title = firstLine.slice(2).trim()
      }
      
      chunks.push({
        doc,
        code: code.replace(/^\n+|\n+$/g, ''),
        lineStart: codeStartLine,
        lineEnd: codeStartLine + currentCode.length - 1,
        isHeader: doc.startsWith('## ') || doc.startsWith('# '),
      })
    }
    currentDoc = []
    currentCode = []
  }
  
  let inDocBlock = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    
    if (isDocComment(line, commentStyle)) {
      if (currentCode.length > 0 && currentCode.some(l => l.trim() !== '')) {
        flushChunk()
        codeStartLine = lineNum
      }
      
      if (!inDocBlock) {
        inDocBlock = true
        codeStartLine = lineNum
      }
      
      currentDoc.push(extractDocContent(line, commentStyle))
    } else {
      if (inDocBlock) {
        inDocBlock = false
        codeStartLine = lineNum
      }
      currentCode.push(line)
    }
  }
  
  flushChunk()
  
  return {
    filename,
    language,
    chunks,
    title,
  }
}

