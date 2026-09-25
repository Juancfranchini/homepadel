'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Copy, ExternalLink, Save, Send, WalletCards } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { CartPanel } from './CartPanel';
import { CustomerFields } from './CustomerFields';
import { PaymentFields } from './PaymentFields';
import { ProductBrowser } from './ProductBrowser';
import { SaleOptionsFields } from './SaleOptionsFields';
import { SavedCarts } from './SavedCarts';
import { SalesLinks } from './SalesLinks';
import { PosFormData, posSchema } from './posSchema';
import { CreatedSale, SavedCart } from './types';
import { usePos } from './usePos';

const defaults: PosFormData = {
  channel: 'LOCAL',
  branchId: '',
  customerId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  discountType: 'AMOUNT',
  discountValue: 0,
  shipping: 0,
  notes: '',
  paymentMethod1: 'CASH',
  paymentAmount1: 0,
  paymentReference1: '',
  paymentMethod2: 'NONE',
  paymentAmount2: 0,
  paymentReference2: '',
};

export default function PointOfSalePage() {
  const pos = usePos();
  const [cartName, setCartName] = useState('');
  const form = useForm<PosFormData>({ resolver: zodResolver(posSchema), defaultValues: defaults });
  const values = form.watch();
  useEffect(() => {
    if (!values.branchId && pos.branches[0]) form.setValue('branchId', pos.branches[0].id);
  }, [form, pos.branches, values.branchId]);
  const resume = async (saved: SavedCart) => {
    await pos.resumeCart(saved);
    form.reset({
      ...defaults,
      channel: saved.channel as PosFormData['channel'],
      branchId: saved.branchId || values.branchId,
      discountType: saved.discountType || 'AMOUNT',
      discountValue: saved.discountValue,
      shipping: saved.shipping,
      notes: saved.notes || '',
    });
  };
  const save = async () => {
    try {
      await pos.saveCart(cartName, values);
      setCartName('');
    } catch {
      pos.setError('No se pudo guardar el carrito');
    }
  };
  return (
    <div className="space-y-5">
      <PosHeader />
      <SavedCarts carts={pos.savedCarts} onResume={resume} />
      <SalesLinks links={pos.salesLinks} />
      {pos.lastSale && <LastSaleBanner sale={pos.lastSale} />}
      {pos.error && <ErrorBanner message={pos.error} />}
      <SaleForm form={form} pos={pos} cartName={cartName} setCartName={setCartName} save={save} />
    </div>
  );
}

function PosHeader() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-lime-600">Ventas</p>
        <h1 className="text-2xl font-black text-gray-900">Punto de Venta</h1>
        <p className="mt-1 text-sm text-gray-500">Stock, pedidos y cobros en un único flujo.</p>
      </div>
      <div className="flex gap-2">
        <Link
          href="/caja"
          className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
        >
          <WalletCards className="h-4 w-4" /> Caja
        </Link>
        <Link
          href="/estadisticas-ventas"
          className="rounded-lg bg-[#0f172a] px-3 py-2 text-sm font-semibold text-white"
        >
          Estadísticas
        </Link>
      </div>
    </header>
  );
}

function LastSaleBanner({ sale }: { sale: CreatedSale }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
        <div>
          <p className="font-bold text-green-900">Venta {sale.number} registrada</p>
          <p className="text-sm text-green-700">
            {formatPrice(sale.total)} · {sale.paymentStatus}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          target="_blank"
          href={`/punto-de-venta/ticket/${sale.id}`}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-green-800"
        >
          Ticket
        </Link>
        <Link
          target="_blank"
          href={`/punto-de-venta/ticket/${sale.id}?mode=exchange`}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-green-800"
        >
          Ticket de cambio
        </Link>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

interface SaleFormProps {
  form: UseFormReturn<PosFormData>;
  pos: ReturnType<typeof usePos>;
  cartName: string;
  setCartName: (name: string) => void;
  save: () => Promise<void>;
}

function SaleForm({ form, pos, cartName, setCartName, save }: SaleFormProps) {
  const values = form.watch();
  const rawDiscount =
    values.discountType === 'PERCENTAGE'
      ? (pos.subtotal * (Number(values.discountValue) || 0)) / 100
      : Number(values.discountValue) || 0;
  const discount = Math.min(pos.subtotal, rawDiscount);
  const total = Math.max(0, pos.subtotal + (Number(values.shipping) || 0) - discount);
  return (
    <form
      onSubmit={form.handleSubmit(pos.sell)}
      className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]"
    >
      <ProductBrowser products={pos.products} onSearch={pos.search} onAdd={pos.addItem} />
      <div className="space-y-5">
        <CartPanel items={pos.cart} subtotal={pos.subtotal} onQuantity={pos.updateQuantity} />
        <SaleDetails form={form} pos={pos} total={total} discount={discount} />
        <CartActions
          values={values}
          pos={pos}
          cartName={cartName}
          setCartName={setCartName}
          save={save}
        />
      </div>
    </form>
  );
}

function SaleDetails({
  form,
  pos,
  total,
  discount,
}: {
  form: UseFormReturn<PosFormData>;
  pos: ReturnType<typeof usePos>;
  total: number;
  discount: number;
}) {
  const values = form.watch();
  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <SaleOptionsFields branches={pos.branches} register={form.register} />
      <CustomerFields
        customers={pos.customers}
        customerId={values.customerId}
        register={form.register}
        errors={form.formState.errors}
      />
      <PaymentFields register={form.register} cashOpen={!!pos.session} />
      <div className="rounded-xl bg-[#0f172a] p-4 text-white">
        <div className="flex justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span>{formatPrice(pos.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-slate-300">
          <span>Descuento + envío</span>
          <span>{formatPrice((Number(values.shipping) || 0) - discount)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-xl font-black">
          <span>Total</span>
          <span className="text-[#C8FF00]">{formatPrice(total)}</span>
        </div>
      </div>
      <button
        disabled={pos.busy || !pos.cart.length}
        className="w-full rounded-xl bg-[#C8FF00] px-5 py-3.5 font-black text-[#0f172a] disabled:opacity-50"
      >
        {pos.busy ? 'Procesando…' : 'Registrar venta'}
      </button>
    </section>
  );
}

function CartActions({
  values,
  pos,
  cartName,
  setCartName,
  save,
}: {
  values: PosFormData;
  pos: ReturnType<typeof usePos>;
  cartName: string;
  setCartName: (name: string) => void;
  save: () => Promise<void>;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex gap-2">
        <input
          value={cartName}
          onChange={(event) => setCartName(event.target.value)}
          placeholder="Nombre del carrito"
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={save}
          disabled={!cartName || !pos.cart.length}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          <Save className="h-4 w-4" /> Guardar
        </button>
      </div>
      {values.channel !== 'LOCAL' && (
        <button
          type="button"
          onClick={() => pos.createLink(values)}
          disabled={!pos.cart.length || pos.busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Send className="h-4 w-4" /> Generar enlace de checkout
        </button>
      )}
      {pos.checkoutUrl && <ShareLink url={pos.checkoutUrl} />}
    </section>
  );
}

function ShareLink({ url }: { url: string }) {
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Hola, podés completar tu compra de Home Pádel acá: ${url}`)}`;
  return (
    <div className="rounded-xl border border-lime-200 bg-lime-50 p-3">
      <p className="break-all text-xs text-lime-900">{url}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(url)}
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold"
        >
          <Copy className="h-3.5 w-3.5" /> Copiar
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
