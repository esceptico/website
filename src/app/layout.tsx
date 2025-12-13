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
  description: "Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.",
  openGraph: {
    title: "Timur Ganiev",
    description: "Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.",
    url: "https://timganiev.com",
    type: "website",
    locale: "en_US",
    siteName: "Timur Ganiev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timur Ganiev",
    description: "Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.",
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`antialiased ${poppins.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#121212" />
      </head>
      <body className={poppins.className}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
