import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to allow dynamic routes with client components
  // Static export conflicts with dynamic routes that need client-side rendering
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
