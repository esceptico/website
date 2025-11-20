import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
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
    <html lang="en" className={`antialiased ${poppins.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#121212" />
      </head>
      <body className={poppins.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
