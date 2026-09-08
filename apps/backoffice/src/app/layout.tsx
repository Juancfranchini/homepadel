// Root layout for Home Pádel BackOffice.
// Minimal wrapper that only sets HTML metadata and body background.
// The dashboard shell (sidebar + header) is provided by the (dashboard) group layout.

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Home Pádel — BackOffice',
  description: 'Panel de administración de Home Pádel',
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%230f172a"/><circle cx="16" cy="16" r="12" fill="%23C8FF00" opacity="0.15"/><text x="16" y="21" font-size="13" font-weight="900" font-family="system-ui" text-anchor="middle" fill="%23C8FF00">HP</text></svg>' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
