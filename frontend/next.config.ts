import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Desarrollo local
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      // Railway (backend en producción)
      { protocol: 'https', hostname: '*.railway.app' },
      { protocol: 'https', hostname: '*.up.railway.app' },
    ],
  },
};

export default nextConfig;
