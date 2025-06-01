# Personal Website

A modern, responsive website built with Next.js 13 that showcases a Machine Learning Engineer. The website features a clean and minimalist design.

## Features

- **Responsive Design**: Mobile-first approach that looks great on all devices
- **Modern UI**: Clean, minimalist design with smooth animations
- **Content**: Navigation items and content focused on Machine Learning Engineering.
- **Interactive Components**: Project cards for ML work

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Headless UI
- Heroicons
- Zustand (State Management)

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
├── app/                    # Next.js 13 app directory
│   ├── about/             # About page 
│   ├── projects/          # ML projects page
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Homepage
├── components/            # Reusable components
└── store/                 # State management
    └── theme.ts           # Theme state using Zustand
```