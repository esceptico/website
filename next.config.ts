import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Add rule for WebAssembly files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });
    
    return config;
  },
};

export default nextConfig;
