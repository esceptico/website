import type { Chunk } from './types';

/**
 * Check if code looks like annotated Python (has # ## headers)
 */
export function isAnnotatedPython(code: string): boolean {
  return /^# ##\s/m.test(code) || /^# #\s/m.test(code);
}

/**
 * Parse annotated Python code into doc+code chunks
 * Lines starting with # become documentation, everything else is code
 */
export function parseAnnotatedCode(code: string): Chunk[] {
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


