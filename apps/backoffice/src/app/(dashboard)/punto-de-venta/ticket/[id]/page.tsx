'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Printer } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

interface TicketOrder {
  number: string;
  createdAt: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  channel: string;
  paymentStatus: string;
  notes?: string;
  branch?: { name: string };
  seller?: { name: string };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; sku: string };
    variant?: { size: string; color?: string };
  }[];
  payments: { id: string; method: string; kind: string; amount: number; reference?: string }[];
}

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const exchange = useSearchParams().get('mode') === 'exchange';
  const [order, setOrder] = useState<TicketOrder | null>(null);
  useEffect(() => {
    api.get(`/orders/${id}`).then((response) => setOrder(response.data));
  }, [id]);
  if (!order) return <p className="p-10 text-center text-sm text-gray-500">Cargando ticket…</p>;
  return <TicketDocument order={order} exchange={exchange} />;
}

function TicketDocument({ order, exchange }: { order: TicketOrder; exchange: boolean }) {
  const buyer = parseBuyer(order.notes);
  return (
    <div className="min-h-screen bg-gray-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-sm rounded-xl bg-white p-6 font-mono text-sm shadow-sm print:shadow-none">
        <div className="text-center">
          <h1 className="text-xl font-black">HOME PÁDEL</h1>
          <p className="text-xs text-gray-500">
            {exchange ? 'TICKET DE CAMBIO' : 'COMPROBANTE DE VENTA'}
          </p>
        </div>
        <TicketHeader order={order} buyerName={buyer.buyerName} />
        <TicketItems order={order} exchange={exchange} />
        {!exchange && <TicketTotals order={order} />}
        <p className="mt-6 text-center text-xs text-gray-500">
          {exchange ? 'Presentar este ticket para realizar el cambio.' : 'Gracias por tu compra.'}
        </p>
      </div>
      <button
        onClick={() => window.print()}
        className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white print:hidden"
      >
        <Printer className="h-4 w-4" /> Imprimir
      </button>
    </div>
  );
}

function TicketHeader({ order, buyerName }: { order: TicketOrder; buyerName?: string }) {
  return (
    <div className="my-5 border-y border-dashed py-3 text-xs">
      <p>Nº {order.number}</p>
      <p>{formatDate(order.createdAt)}</p>
      <p>
        {order.branch?.name || 'Tienda online'} · {order.seller?.name || 'Web'}
      </p>
      <p>Canal: {order.channel}</p>
      {buyerName && <p>Cliente: {buyerName}</p>}
    </div>
  );
}

function TicketItems({ order, exchange }: { order: TicketOrder; exchange: boolean }) {
  return (
    <div className="space-y-3">
      {order.items.map((item) => (
        <div key={item.id} className="flex justify-between gap-3">
          <div>
            <p>
              {item.quantity} x {item.product.name}
            </p>
            <p className="text-xs text-gray-500">
              {item.variant
                ? [item.variant.size, item.variant.color].filter(Boolean).join(' / ')
                : item.product.sku}
            </p>
          </div>
          {!exchange && <span>{formatPrice(item.price * item.quantity)}</span>}
        </div>
      ))}
    </div>
  );
}

function TicketTotals({ order }: { order: TicketOrder }) {
  const paymentText =
    order.payments
      .map((payment) => `${payment.method} ${formatPrice(payment.amount)}`)
      .join(' + ') || 'pendiente';
  return (
    <div className="mt-5 space-y-1 border-t border-dashed pt-3">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(order.subtotal)}</span>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between">
          <span>Descuento</span>
          <span>-{formatPrice(order.discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Envío</span>
        <span>{formatPrice(order.shipping)}</span>
      </div>
      <div className="flex justify-between text-base font-black">
        <span>TOTAL</span>
        <span>{formatPrice(order.total)}</span>
      </div>
      <p className="pt-2 text-xs">
        Cobro: {order.paymentStatus} · {paymentText}
      </p>
    </div>
  );
}

function parseBuyer(notes?: string): { buyerName?: string } {
  if (!notes) return {};
  try {
    return JSON.parse(notes);
  } catch {
    return {};
  }
}
