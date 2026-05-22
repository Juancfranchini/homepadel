// Root layout for Home Pádel BackOffice.
// Minimal wrapper that only sets HTML metadata and body background.
// The dashboard shell (sidebar + header) is provided by the (dashboard) group layout.

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Home Pádel — BackOffice',
  description: 'Panel de administración de Home Pádel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
