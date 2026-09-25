'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { SalesLink } from './types';

const STATUS: Record<string, string> = {
  OPEN: 'Pendiente',
  CHECKOUT: 'Checkout iniciado',
  CONVERTED: 'Pagado',
  EXPIRED: 'Vencido',
  CANCELLED: 'Cancelado',
};

export function SalesLinks({ links }: { links: SalesLink[] }) {
  if (!links.length) return null;
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-bold">Enlaces de venta recientes</h2>
      <div className="space-y-2">
        {links.slice(0, 6).map((link) => (
          <div
            key={link.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs"
          >
            <div>
              <p className="font-semibold">
                {link.channel} · {STATUS[link.status] || link.status}
              </p>
              <p className="text-gray-500">{link.order?.number || 'Sin venta confirmada'}</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(link.checkoutUrl)}
                className="rounded-md bg-white p-2"
                title="Copiar enlace"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <a
                href={link.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-white p-2"
                title="Abrir enlace"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
