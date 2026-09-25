'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { getSalesLink } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface LinkItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product: Product;
}

interface LinkData {
  status: string;
  token: string;
  items: LinkItem[];
}

export default function SalesLinkPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const cart = useCartStore();
  const [data, setData] = useState<LinkData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSalesLink(token)
      .then(setData)
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'El enlace no está disponible');
      });
  }, [token]);

  const continueToCheckout = () => {
    if (!data) return;
    cart.clearCart();
    for (const item of data.items) {
      const product = { ...item.product, effectivePrice: item.price };
      const variant = product.variants?.find((candidate) => candidate.id === item.variantId);
      cart.addItem(product, item.quantity, variant);
    }
    cart.setSalesLinkToken(data.token);
    router.push('/checkout');
  };

  if (error || data?.status === 'CONVERTED') {
    return <Message text={error || 'Esta venta ya fue completada.'} />;
  }
  if (!data) return <Message loading text="Preparando tu compra…" />;

  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <main className="min-h-screen bg-[#050606] px-5 py-16 text-[#F7F6F7]">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0F1111]">
        <div className="border-b border-white/10 p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8FF00]">Home Pádel</p>
          <h1 className="mt-2 text-3xl font-black">Tu compra está lista</h1>
          <p className="mt-2 text-sm text-[#8A8A85]">
            Revisá los productos y completá tus datos en nuestro checkout seguro.
          </p>
        </div>
        <div className="space-y-3 p-7">
          {data.items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'base'}`}
              className="flex items-center justify-between rounded-xl bg-white/5 p-4"
            >
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-[#8A8A85]">{item.quantity} unidad/es</p>
              </div>
              <p className="font-bold text-[#C8FF00]">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xl font-black">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button
            onClick={continueToCheckout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8FF00] px-5 py-4 font-black text-[#0f172a] hover:bg-[#b8ef00]"
          >
            Completar compra <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </main>
  );
}

function Message({ text, loading = false }: { text: string; loading?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050606] px-5 text-[#F7F6F7]">
      <div className="text-center">
        {loading ? (
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#C8FF00]" />
        ) : (
          <ShoppingBag className="mx-auto mb-4 h-8 w-8 text-[#C8FF00]" />
        )}
        <p>{text}</p>
      </div>
    </main>
  );
}
