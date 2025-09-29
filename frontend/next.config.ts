import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  eslint: {
    // Skip ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript type checking during builds for production deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
