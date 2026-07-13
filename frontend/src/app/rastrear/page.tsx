'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowRight, ShoppingBag, MapPin, Mail, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Confirmado', icon: Clock, desc: 'Recibimos tu pedido y lo estamos preparando', color: 'text-amber-400', bg: 'bg-amber-400/10', line: 'bg-amber-400/30' },
  { key: 'PAID', label: 'Pago Aprobado', icon: CheckCircle, desc: 'El pago fue verificado exitosamente', color: 'text-blue-400', bg: 'bg-blue-400/10', line: 'bg-blue-400/30' },
  { key: 'SHIPPED', label: 'En Camino', icon: Truck, desc: 'Tu pedido esta en viaje a tu domicilio', color: 'text-purple-400', bg: 'bg-purple-400/10', line: 'bg-purple-400/30' },
  { key: 'DELIVERED', label: 'Entregado', icon: Package, desc: 'El pedido fue recibido correctamente', color: 'text-green-400', bg: 'bg-green-400/10', line: 'bg-green-400/30' },
  { key: 'CANCELLED', label: 'Cancelado', icon: XCircle, desc: 'Este pedido fue cancelado', color: 'text-red-400', bg: 'bg-red-400/10', line: 'bg-red-400/30' },
];

interface TrackedOrder {
  number: string;
  status: string;
  total: number;
  createdAt: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerName?: string;
  items: { quantity: number; product: { name: string; images: string[] } }[];
}

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
    if (!orderNumber.trim()) { setError('Ingresa un numero de orden'); return; }
    if (!email.trim() && !phone.trim()) { setError('Ingresa tu email o telefono para verificar'); return; }
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

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;
  const isCancelled = order?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#B7D31A]/10 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-[#B7D31A]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">Rastrear mi pedido</h1>
          <p className="text-[#8A8A85] text-sm mt-1">Ingresa tu numero de orden y email o telefono</p>
        </div>

        <form onSubmit={handleTrack} className="mb-8 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A85]" />
            <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="Numero de orden: HP-1234567890"
              className="w-full pl-12 pr-4 py-4 bg-[#0F1111] border border-[#B7D31A]/20 rounded-xl text-lg font-bold text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:shadow-[0_0_20px_rgba(183,211,26,0.1)] transition-all uppercase tracking-wider text-center" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email de la compra"
                className="w-full pl-10 pr-4 py-3 bg-[#0F1111] border border-[#1A1F21] rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefono"
                className="w-full pl-10 pr-4 py-3 bg-[#0F1111] border border-[#1A1F21] rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-[#B7D31A] text-[#050606] rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-[#050606] border-t-transparent rounded-full animate-spin" /> : <>Buscar pedido <ArrowRight size={16} /></>}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        {searched && error && !order && (
          <div className="bg-[#0F1111] rounded-2xl border border-red-500/20 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><XCircle className="w-10 h-10 text-red-500" /></div>
            <h2 className="text-xl font-bold text-[#F7F6F7] mb-2">Pedido no encontrado</h2>
            <p className="text-[#8A8A85] text-sm mb-6">Verifica el numero de orden y los datos ingresados.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setOrderNumber(''); setEmail(''); setPhone(''); setError(''); setSearched(false); }} className="px-6 py-2.5 border border-[#B7D31A]/30 text-[#F7F6F7] rounded-xl text-sm font-semibold hover:bg-[#B7D31A]/5 transition-colors">Intentar de nuevo</button>
              <Link href="/contacto" className="px-6 py-2.5 bg-[#B7D31A] text-[#050606] rounded-xl text-sm font-semibold hover:bg-[#c8e81f] transition-colors">Contactar soporte</Link>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Pedido</p><p className="text-xl font-black text-[#B7D31A]">{order.number}</p></div>
                <div className="text-right"><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Fecha</p><p className="text-sm font-semibold text-[#F7F6F7]">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#0D0F0F]">
                <div><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Productos</p><p className="text-sm font-semibold text-[#F7F6F7]">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p></div>
                <div className="text-right"><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Total</p><p className="text-lg font-black text-[#F7F6F7]">{formatPrice(order.total)}</p></div>
              </div>
              {(order.buyerEmail || order.buyerPhone) && (
                <div className="flex items-center gap-4 pt-4 border-t border-[#0D0F0F] text-xs text-[#8A8A85]">
                  {order.buyerEmail && <span className="flex items-center gap-1"><Mail size={12} /> {order.buyerEmail}</span>}
                  {order.buyerPhone && <span className="flex items-center gap-1"><Phone size={12} /> {order.buyerPhone}</span>}
                </div>
              )}
            </div>

            <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
              <h3 className="text-sm font-semibold text-[#F7F6F7] mb-6">Estado del envio</h3>
              <div className="relative">
                {STATUS_STEPS.filter((s) => s.key !== 'CANCELLED' || isCancelled).map((step, index, arr) => {
                  const isActive = index <= currentStepIndex && !isCancelled;
                  const isCurrent = step.key === order.status;
                  const showCancelled = isCancelled && step.key === 'CANCELLED';
                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      {index < arr.length - 1 && (
                        <div className="absolute left-[27px] top-14 w-0.5" style={{ height: 'calc(100% - 28px)' }}>
                          <div className="w-full h-full bg-[#1A1F21] rounded-full">
                            <div className={'w-full rounded-full transition-all duration-1000 ease-out ' + step.line} style={{ height: isActive && !isCancelled ? '100%' : '0%' }} />
                          </div>
                        </div>
                      )}
                      <div className={'relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ' +
                        (showCancelled ? 'bg-red-500/20 text-red-500' : isCurrent ? 'bg-[#B7D31A] text-[#050606] shadow-[0_0_20px_rgba(183,211,26,0.3)]' : isActive ? step.bg + ' ' + step.color : 'bg-[#1A1F21] text-[#8A8A85]')}>
                        <step.icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0 pt-3 pb-8">
                        <p className={'text-base font-bold transition-colors duration-300 ' + (isActive || showCancelled ? 'text-[#F7F6F7]' : 'text-[#8A8A85]')}>{step.label}</p>
                        <p className="text-sm text-[#8A8A85] mt-1">{step.desc}</p>
                        {isCurrent && !isCancelled && <div className="flex items-center gap-2 mt-2"><span className="w-2 h-2 rounded-full bg-[#B7D31A] animate-pulse" /><span className="text-xs text-[#B7D31A] font-medium">Estado actual</span></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
              <h3 className="text-sm font-semibold text-[#F7F6F7] mb-4 flex items-center gap-2"><ShoppingBag size={16} className="text-[#B7D31A]" />Productos en este pedido</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#0D0F0F] last:border-0">
                    <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[#1A1F21] flex items-center justify-center text-xs font-bold text-[#B7D31A]">{item.quantity}x</span><span className="text-sm text-[#C7C7C0]">{item.product.name}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1 py-3 border border-[#0D0F0F] rounded-xl text-sm font-semibold text-[#C7C7C0] text-center hover:bg-[#0C0C0C] transition-colors">Volver al inicio</Link>
              <Link href="/contacto" className="flex-1 py-3 border border-[#B7D31A]/30 rounded-xl text-sm font-semibold text-[#B7D31A] text-center hover:bg-[#B7D31A]/5 transition-colors">Necesito ayuda</Link>
            </div>
          </div>
        )}

        {!searched && !order && (
          <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1A1F21] flex items-center justify-center mx-auto mb-4"><MapPin className="w-10 h-10 text-[#8A8A85]" /></div>
            <h2 className="text-lg font-bold text-[#F7F6F7] mb-2">Encontra tu pedido</h2>
            <p className="text-[#8A8A85] text-sm">El numero de orden lo encontras en el email de confirmacion que te enviamos al finalizar tu compra.</p>
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
