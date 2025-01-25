# Dual-Mode Personal Website

A modern, responsive website built with Next.js 13 that showcases two distinct professional identities: Machine Learning Engineer and Photographer. The website features a seamless mode switch that transforms the content and styling based on the selected persona.

## Features

- **Dual Mode Toggle**: Switch between Machine Learning Engineer and Photography modes
- **Responsive Design**: Mobile-first approach that looks great on all devices
- **Modern UI**: Clean, minimalist design with smooth animations
- **Mode-Specific Content**: Different navigation items and content based on the selected mode
- **Interactive Components**: Image lightbox for photography portfolio, project cards for ML work

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
│   ├── about/             # About page (shows different content based on mode)
│   ├── portfolio/         # Photography portfolio page
│   ├── projects/          # ML projects page
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Homepage with mode selection
├── components/            # Reusable components
│   ├── Navigation.tsx     # Main navigation bar with mode toggle
│   └── ThemeToggle.tsx    # Mode toggle component
└── store/                 # State management
    └── theme.ts           # Theme/mode state using Zustand
```

## Customization

### Content

1. **ML Engineer Content**:
   - Update the projects array in `src/app/projects/page.tsx`
   - Modify the MLEContent component in `src/app/about/page.tsx`

2. **Photography Content**:
   - Update the photos array in `src/app/portfolio/page.tsx`
   - Modify the PhotographyContent component in `src/app/about/page.tsx`

### Styling

1. **Colors**:
   - ML Engineer mode uses indigo as the primary color
   - Photography mode uses amber as the primary color
   - Modify these in the respective components or create a theme configuration

2. **Layout**:
   - Adjust the max-width, padding, and grid layouts in the components
   - Modify the Tailwind configuration in `tailwind.config.ts`

### Navigation

- Update the navigation links in `src/components/Navigation.tsx`
- Modify the `mleLinks` and `photographyLinks` arrays to add/remove pages

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to your preferred hosting platform (Vercel recommended for Next.js):
   ```bash
   vercel deploy
   ```

## SEO

- Update the metadata in `src/app/layout.tsx`
- Add page-specific metadata in each page component
- Consider adding a sitemap for better search engine indexing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project as a template for your own personal website.

## Support

For questions or issues, please open an issue in the GitHub repository.
