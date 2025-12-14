import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
};

export default nextConfig;
