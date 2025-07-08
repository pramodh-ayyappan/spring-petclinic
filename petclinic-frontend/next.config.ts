import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Configure image optimization for production
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Configure environment variables
  env: {
    // For Kubernetes deployment, use relative URL so it uses same domain
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/',
  },
};

export default nextConfig;
