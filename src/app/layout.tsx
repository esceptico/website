import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

// Use JetBrains Mono - modern and smooth monospace font
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: "Timur Ganiev",
  description: "Hey 👋",
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
    <html lang="en" className={`antialiased ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#121212" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
