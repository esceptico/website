import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ML Engineer & Photographer Portfolio",
  description: "Personal website showcasing machine learning engineering projects and photography portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <AnimatedBackground />
        <div className="relative min-h-screen">
          <Navigation />
          <main className="pt-20 relative">
            {children}
          </main>
          <footer className="relative mt-auto py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>© {new Date().getFullYear()}</span>
                <a 
                  href="mailto:your@email.com" 
                  className="hover:text-gray-800 transition-colors"
                >
                  your@email.com
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
