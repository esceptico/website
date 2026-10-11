import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure trailing slashes are consistent
  trailingSlash: false,

  // A lockfile in the home dir made Next pick ~ as the workspace root, which
  // broke CSS hot reload. Pin it to this project.
  turbopack: {
    root: path.join(__dirname),
  },
  
  async redirects() {
    return [
      // Legacy /docs -> /log redirects
      {
        source: '/docs',
        destination: '/log',
        permanent: true,
      },
      {
        source: '/docs/:slug',
        destination: '/log/:slug',
        permanent: true,
      },
      // Legacy /blog -> /log redirects (old site structure)
      {
        source: '/blog',
        destination: '/log',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/log',
        permanent: true,
      },
      // Legacy /about page redirects
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about/:path*',
        destination: '/',
        permanent: true,
      },
      // Legacy /portfolio and /projects redirects
      {
        source: '/portfolio',
        destination: '/',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
