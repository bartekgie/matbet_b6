import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/matbet',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
