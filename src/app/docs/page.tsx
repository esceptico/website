import { getAllDocs } from '@/lib/docs';
import { DocsIndexClient } from './DocsIndexClient';

export default function DocsIndexPage() {
  const docs = getAllDocs();
  return <DocsIndexClient docs={docs} />;
}
