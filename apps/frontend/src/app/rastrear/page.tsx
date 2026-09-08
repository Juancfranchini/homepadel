'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Truck, XCircle, MapPin } from 'lucide-react';
import { TrackedOrder } from './types';
import RastrearForm from './RastrearForm';
import RastrearOrderCard from './RastrearOrderCard';
import RastrearStatusTimeline from './RastrearStatusTimeline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function RastrearContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) { setError('Ingresa un número de orden'); return; }
    if (!email.trim() && !phone.trim()) { setError('Ingresa tu email o teléfono para verificar'); return; }
    setLoading(true); setError(''); setOrder(null); setSearched(false);
    try {
      const params = new URLSearchParams();
      if (email.trim()) params.append('email', email.trim());
      if (phone.trim()) params.append('phone', phone.trim());
      const res = await fetch(API_URL + '/orders/track/' + orderNumber.trim() + '?' + params.toString());
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || 'Pedido no encontrado'); }
      setOrder(await res.json());
    } catch (err: any) { setError(err.message || 'No encontramos tu pedido.'); }
    finally { setLoading(false); setSearched(true); }
  };

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#B7D31A]/10 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-[#B7D31A]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">Rastrear mi pedido</h1>
          <p className="text-[#8A8A85] text-sm mt-1">Ingresa tu número de orden y email o teléfono</p>
        </div>

        <RastrearForm
          orderNumber={orderNumber} onOrderNumberChange={setOrderNumber}
          email={email} onEmailChange={setEmail}
          phone={phone} onPhoneChange={setPhone}
          loading={loading} error={error} onSubmit={handleTrack}
        />

        {searched && error && !order && (
          <div className="bg-[#0F1111] rounded-2xl border border-red-500/20 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><XCircle className="w-10 h-10 text-red-500" /></div>
            <h2 className="text-xl font-bold text-[#F7F6F7] mb-2">Pedido no encontrado</h2>
            <p className="text-[#8A8A85] text-sm mb-6">Verifica el número de orden y los datos ingresados.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setOrderNumber(''); setEmail(''); setPhone(''); setError(''); setSearched(false); }} className="px-6 py-2.5 border border-[#B7D31A]/30 text-[#F7F6F7] rounded-xl text-sm font-semibold hover:bg-[#B7D31A]/5 transition-colors">Intentar de nuevo</button>
              <Link href="/contacto" className="px-6 py-2.5 bg-[#B7D31A] text-[#050606] rounded-xl text-sm font-semibold hover:bg-[#c8e81f] transition-colors">Contactar soporte</Link>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <RastrearOrderCard order={order} />
            <RastrearStatusTimeline order={order} />

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1 py-3 bg-[#0A2D3D] text-[#F7F6F7] rounded-xl font-semibold text-sm uppercase tracking-wider text-center hover:bg-[#0D3D52] transition-colors">Volver al inicio</Link>
              <Link href="/contacto" className="flex-1 py-3 border border-[#B7D31A]/30 rounded-xl text-sm font-semibold text-[#B7D31A] text-center hover:bg-[#B7D31A]/5 transition-colors">Necesito ayuda</Link>
            </div>
          </div>
        )}

        {!searched && !order && (
          <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1A1F21] flex items-center justify-center mx-auto mb-4"><MapPin className="w-10 h-10 text-[#8A8A85]" /></div>
            <h2 className="text-lg font-bold text-[#F7F6F7] mb-2">Encontra tu pedido</h2>
            <p className="text-[#8A8A85] text-sm">El número de orden lo encontras en el email de confirmacion que te enviamos al finalizar tu compra.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RastrearPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050606] flex items-center justify-center"><span className="w-8 h-8 border-2 border-[#B7D31A] border-t-transparent rounded-full animate-spin" /></div>}>
      <RastrearContent />
    </Suspense>
  );
}
