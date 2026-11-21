import type { BlogPost } from '@/lib/blog/types';
import { CodeBlockWithCopy } from './interactive/CodeBlockWithCopy';
import { HeadingWithAnchor } from './interactive/HeadingWithAnchor';
import { SECTION_HEADING_CLASS } from './heading-styles';

// "Cite this post" block at the end of every post, built from the post's
// frontmatter so no post has to write its own.

const AUTHOR = 'Timur Ganiev';
const SITE = 'timganiev.com';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeBibtex = (s: string) => s.replace(/([&%$#_])/g, '\\$1');

export function Citation({ post }: { post: BlogPost }) {
  // Without a date there is no year to cite.
  if (!post.date) return null;

  const [year, month] = post.date.split('-');
  const monthName = MONTHS[Number(month) - 1]!;
  const url = `https://${SITE}/log/${post.slug}`;
  const key = `ganiev${year}${post.slug.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

  const plain = `${AUTHOR}, "${post.title}", ${SITE}, ${monthName} ${year}. ${url}`;
  const bibtex = [
    `@misc{${key},`,
    `  author = {${AUTHOR}},`,
    `  title = {${escapeBibtex(post.title)}},`,
    `  year = {${year}},`,
    `  month = {${monthName.toLowerCase()}},`,
    `  howpublished = {${SITE}},`,
    `  url = {${url}},`,
    `}`,
  ].join('\n');

  const text = 'mb-3 text-[var(--theme-text-secondary)] leading-relaxed';

  return (
    <section className="mt-12 pt-6 border-t border-[var(--theme-border)]">
      <HeadingWithAnchor as="h1" id="citation" className={SECTION_HEADING_CLASS}>
        Citation
      </HeadingWithAnchor>
      <p className={text}>If you reference this post, cite it as:</p>
      <CodeBlockWithCopy code={plain} codeHtml={escapeHtml(plain)} />
      <p className={text}>BibTeX:</p>
      <CodeBlockWithCopy code={bibtex} codeHtml={escapeHtml(bibtex)} />
    </section>
  );
}
