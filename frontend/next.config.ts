import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    if (backendUrl && !backendUrl.startsWith('/')) {
      const target = backendUrl.replace(/\/api\/?$/, '');
      return [
        {
          source: '/api/:path*',
          destination: `${target}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
