import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // El lint es un chequeo aparte (`npm run lint`, y CI) — no bloquea el build
  // de producción. Con esto en false, `next build`/Vercel fallaría cada vez
  // que exista una sola línea de deuda de lint ya conocida (ver
  // docs/convenciones-codigo.md), que hoy es la mayoría de los componentes.
  eslint: { ignoreDuringBuilds: true },
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
