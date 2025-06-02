import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'jetbrains-mono': ['JetBrains Mono', 'var(--font-jetbrains-mono)', 'monospace'],
        'mono': ['JetBrains Mono', 'var(--font-jetbrains-mono)', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
