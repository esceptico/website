import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

// Use JetBrains Mono - modern and smooth monospace font
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: "Timur Ganiev",
  description: "Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.",
  openGraph: {
    title: "Timur Ganiev",
    description: "Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.",
    type: "website",
    locale: "en_US",
    siteName: "Timur Ganiev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timur Ganiev",
    description: "Machine Learning Engineer specializing in post-training and safety alignment for production LLM systems.",
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`antialiased ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#121212" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
