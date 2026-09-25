'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';

interface Item {
  id: string;
  quantity: number;
  product: { name: string };
}
interface Order {
  id: string;
  status: string;
  paymentStatus?: string;
  total: number;
  items?: Item[];
}
const paymentSchema = z.object({
  method: z.enum(['CASH', 'TRANSFER', 'CARD', 'DIGITAL_WALLET', 'EXTERNAL_TERMINAL']),
  amount: z.coerce.number().positive(),
  reference: z.string().optional(),
});
const returnSchema = z.object({
  type: z.enum(['RETURN', 'EXCHANGE']),
  orderItemId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().min(2),
  refundAmount: z.coerce.number().min(0),
  refundMethod: z.enum([
    'CASH',
    'TRANSFER',
    'CARD',
    'DIGITAL_WALLET',
    'EXTERNAL_TERMINAL',
    'MERCADOPAGO',
  ]),
  reference: z.string().optional(),
});
type PaymentData = z.infer<typeof paymentSchema>;
type ReturnData = z.infer<typeof returnSchema>;

function useAftercare(order: Order, onChanged: () => void) {
  const [cashSessionId, setCashSessionId] = useState<string>();
  const [message, setMessage] = useState('');
  const payment = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: 'CASH', amount: 0, reference: '' },
  });
  const saleReturn = useForm<ReturnData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      type: 'RETURN',
      orderItemId: order.items?.[0]?.id || '',
      quantity: 1,
      reason: '',
      refundAmount: 0,
      refundMethod: 'CASH',
      reference: '',
    },
  });
  useEffect(() => {
    api.get('/cash/sessions/current').then((response) => setCashSessionId(response.data?.id));
  }, []);
  const addPayment = async (data: PaymentData) => {
    await api.post(`/pos/orders/${order.id}/payments`, { cashSessionId, payments: [data] });
    setMessage('Cobro registrado');
    onChanged();
  };
  const createReturn = async (data: ReturnData) => {
    await api.post(`/pos/orders/${order.id}/returns`, {
      type: data.type,
      reason: data.reason,
      cashSessionId,
      refundAmount: data.refundAmount,
      refundMethod: data.refundAmount > 0 ? data.refundMethod : undefined,
      reference: data.reference || undefined,
      items: [{ orderItemId: data.orderItemId, quantity: data.quantity, restock: true }],
    });
    setMessage(data.type === 'EXCHANGE' ? 'Cambio registrado' : 'Devolución registrada');
    onChanged();
  };
  const cancel = async () => {
    const reason = window.prompt('Motivo de la cancelación');
    if (!reason) return;
    await api.post(`/pos/orders/${order.id}/cancel`, { reason, cashSessionId });
    setMessage('Venta cancelada');
    onChanged();
  };
  return { message, payment, saleReturn, addPayment, createReturn, cancel };
}

export function OrderAftercare({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const actions = useAftercare(order, onChanged);
  const active = order.status !== 'CANCELLED';
  return (
    <div className="space-y-4 border-t pt-4">
      {actions.message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{actions.message}</p>
      )}
      <TicketActions order={order} active={active} onCancel={actions.cancel} />
      {active && order.paymentStatus !== 'PAID' && (
        <PendingPaymentForm form={actions.payment} onSubmit={actions.addPayment} />
      )}
      {active && !!order.items?.length && (
        <ReturnForm items={order.items} form={actions.saleReturn} onSubmit={actions.createReturn} />
      )}
    </div>
  );
}

function TicketActions({
  order,
  active,
  onCancel,
}: {
  order: Order;
  active: boolean;
  onCancel: () => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        target="_blank"
        href={`/punto-de-venta/ticket/${order.id}`}
        className="rounded-lg border px-3 py-2 text-xs font-semibold"
      >
        Imprimir ticket
      </Link>
      <Link
        target="_blank"
        href={`/punto-de-venta/ticket/${order.id}?mode=exchange`}
        className="rounded-lg border px-3 py-2 text-xs font-semibold"
      >
        Ticket de cambio
      </Link>
      {active && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
        >
          Cancelar venta
        </button>
      )}
    </div>
  );
}

function PendingPaymentForm({
  form,
  onSubmit,
}: {
  form: UseFormReturn<PaymentData>;
  onSubmit: (data: PaymentData) => Promise<void>;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 rounded-xl bg-gray-50 p-3">
      <p className="text-sm font-bold">Registrar cobro pendiente</p>
      <div className="grid grid-cols-3 gap-2">
        <select {...form.register('method')} className="rounded-lg border px-2 py-2 text-xs">
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
          <option value="DIGITAL_WALLET">Billetera</option>
          <option value="EXTERNAL_TERMINAL">Terminal</option>
        </select>
        <input
          {...form.register('amount')}
          type="number"
          min="0"
          placeholder="Importe"
          className="rounded-lg border px-2 py-2 text-xs"
        />
        <input
          {...form.register('reference')}
          placeholder="Referencia"
          className="rounded-lg border px-2 py-2 text-xs"
        />
      </div>
      <button className="rounded-lg bg-[#0f172a] px-3 py-2 text-xs font-bold text-white">
        Guardar cobro
      </button>
    </form>
  );
}

function ReturnForm({
  items,
  form,
  onSubmit,
}: {
  items: Item[];
  form: UseFormReturn<ReturnData>;
  onSubmit: (data: ReturnData) => Promise<void>;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 rounded-xl bg-gray-50 p-3">
      <p className="text-sm font-bold">Cambio o devolución</p>
      <div className="grid grid-cols-2 gap-2">
        <select {...form.register('type')} className="rounded-lg border px-2 py-2 text-xs">
          <option value="RETURN">Devolución</option>
          <option value="EXCHANGE">Cambio</option>
        </select>
        <select {...form.register('orderItemId')} className="rounded-lg border px-2 py-2 text-xs">
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.product.name} ({item.quantity})
            </option>
          ))}
        </select>
        <input
          {...form.register('quantity')}
          type="number"
          min="1"
          placeholder="Cantidad"
          className="rounded-lg border px-2 py-2 text-xs"
        />
        <input
          {...form.register('reason')}
          placeholder="Motivo"
          className="rounded-lg border px-2 py-2 text-xs"
        />
        <input
          {...form.register('refundAmount')}
          type="number"
          min="0"
          placeholder="Reintegro"
          className="rounded-lg border px-2 py-2 text-xs"
        />
        <select {...form.register('refundMethod')} className="rounded-lg border px-2 py-2 text-xs">
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
          <option value="DIGITAL_WALLET">Billetera</option>
          <option value="EXTERNAL_TERMINAL">Terminal</option>
          <option value="MERCADOPAGO">Mercado Pago (ya reintegrado)</option>
        </select>
        <input
          {...form.register('reference')}
          placeholder="Referencia del reintegro"
          className="rounded-lg border px-2 py-2 text-xs"
        />
      </div>
      <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold">
        Registrar posventa
      </button>
    </form>
  );
}
