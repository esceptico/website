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
    
    
    // Add aliases for node-specific modules when bundling for the browser
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    
    // Ensure workers are properly handled
    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    config.output.publicPath = "/_next/";
    
    return config;
  },
  serverExternalPackages: ["sharp", "onnxruntime-node"],
};

export default nextConfig;
