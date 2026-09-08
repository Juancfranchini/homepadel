import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // El lint es un chequeo aparte (`npm run lint`, y CI) — no bloquea el build
  // de producción. Ver next.config.ts de frontend para el detalle.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'https', hostname: '*.railway.app' },
      { protocol: 'https', hostname: '*.up.railway.app' },
    ],
  },
};

export default nextConfig;
