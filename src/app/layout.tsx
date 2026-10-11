import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "katex/dist/katex.min.css";
import ClientLayout from "./ClientLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-poppins'
});

// Use JetBrains Mono - modern and smooth monospace font
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://timganiev.com'),
  title: "Timur Ganiev",
  description: "Research Engineer working on agent memory, context engineering, and reliable long-running systems.",
  openGraph: {
    title: "Timur Ganiev",
    description: "Research Engineer working on agent memory, context engineering, and reliable long-running systems.",
    url: "https://timganiev.com",
    type: "website",
    locale: "en_US",
    siteName: "Timur Ganiev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timur Ganiev",
    description: "Research Engineer working on agent memory, context engineering, and reliable long-running systems.",
    creator: "@postimortem",
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
  alternates: {
    canonical: "https://timganiev.com",
    types: {
      'application/rss+xml': 'https://timganiev.com/feed.xml',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Next 16 only resets smooth scroll during route changes when this is set;
      // without it every navigation visibly scrolls the old page to the top.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`antialiased ${poppins.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Plain inline script so it runs while <head> parses, before first paint.
            (next/script beforeInteractive is deferred until the JS bootstrap in
            the App Router, which flashed light mode for dark users.) The OS
            preference is applied but not persisted, so it can still follow the OS. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){var l=localStorage.getItem('theme-storage');if(l){var p=JSON.parse(l);t=p&&p.state&&p.state.colorScheme;}}if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',t==='dark'?'#0a0a0a':'#fafafa');}}catch(e){}})();`,
          }}
        />
        <meta name="theme-color" content="#fafafa" />
      </head>
      <body className={poppins.className}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
