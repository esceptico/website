import type { Metadata } from 'next';
import Image from 'next/image';
import { TapeDemo } from '@/components/tape/TapeDemo';

const description = 'A rolling buffer of mic and system audio for Mac. Save the last few minutes after they happened.';

export const metadata: Metadata = {
  title: 'Tape | Timur Ganiev',
  description,
  openGraph: {
    title: 'Tape | Timur Ganiev',
    description,
    url: 'https://timganiev.com/tape',
    type: 'website',
    siteName: 'Timur Ganiev',
  },
  twitter: {
    card: 'summary',
    title: 'Tape | Timur Ganiev',
    description,
    creator: '@postimortem',
  },
  alternates: {
    canonical: 'https://timganiev.com/tape',
  },
};

export default function TapePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-20 md:pt-28 pb-24">
      <article className="flex flex-col items-center text-center">
        <Image src="/tape/icon.png" alt="" width={96} height={96} priority />
        <h1 className="mt-3 text-3xl md:text-4xl font-medium tracking-tight text-[var(--theme-text-primary)]">tape</h1>
        <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-[var(--theme-text-secondary)]">
          a rolling buffer of mic and system audio for your mac. when you need to hear what was just said on a call,
          open it and save that part.
        </p>

        {/* The one thing to do on this page, so it is the largest and the only solid amber block above the demo. */}
        <a
          href="/tape/Tape.dmg"
          download
          className="mt-9 inline-flex h-13 items-center gap-2.5 rounded-full px-8 text-base font-semibold shadow-[0_10px_30px_-10px_rgba(255,214,10,0.55)] transition-transform duration-150 ease-out hover:brightness-105 active:scale-[0.97]"
          // globals.css sets `a { color: inherit }` outside any layer, which beats a Tailwind text colour.
          style={{ color: '#111', background: '#ffd60a' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2v8.5M4.5 7.5 8 11l3.5-3.5M3 14h10" />
          </svg>
          download for mac
        </a>
        <p className="mt-3 font-mono text-xs text-[var(--theme-text-muted)]">macos 14.2 or later · 0.6 mb</p>

        <div className="mt-16 flex w-full justify-center text-left">
          <TapeDemo />
        </div>

        <p className="mt-12 font-mono text-xs text-[var(--theme-text-muted)]">
          uses about 0.5% of one cpu core on an apple silicon macbook.
        </p>
      </article>
    </div>
  );
}
