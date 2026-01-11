import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formula Linker | Timur Ganiev',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FormulaLinkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
