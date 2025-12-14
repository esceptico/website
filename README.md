# Personal Website

A modern, responsive website built with Next.js (App Router). Clean minimal design, a `/log` section for posts, and a few interactive UI bits.

## Features

- **Responsive Design**: Mobile-first approach that looks great on all devices
- **Modern UI**: Clean, minimalist design with smooth animations
- **Content**: Home page + `/log` posts written in Markdown (with math/code rendering)
- **SEO**: Sitemap + robots.txt + OG/Twitter metadata

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Heroicons

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── log/               # Blog/log pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
├── content/               # Markdown posts
└── lib/                   # Blog parsing + helpers
```