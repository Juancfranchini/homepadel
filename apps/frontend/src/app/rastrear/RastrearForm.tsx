'use client';

import { Search, Mail, Phone, ArrowRight } from 'lucide-react';

interface Props {
  orderNumber: string;
  onOrderNumberChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RastrearForm({ orderNumber, onOrderNumberChange, email, onEmailChange, phone, onPhoneChange, loading, error, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A85]" />
        <input type="text" value={orderNumber} onChange={(e) => onOrderNumberChange(e.target.value.toUpperCase())}
          placeholder="Número de orden: HP-1234567890"
          className="w-full pl-12 pr-4 py-4 bg-[#0F1111] border border-[#B7D31A]/50 rounded-xl text-lg font-bold text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:shadow-[0_0_20px_rgba(183,211,26,0.1)] transition-all uppercase tracking-wider text-center" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
          <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Email de la compra"
            className="w-full pl-10 pr-4 py-3 bg-[#0F1111] border border-[#B7D31A]/40 rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors" />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
          <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Teléfono"
            className="w-full pl-10 pr-4 py-3 bg-[#0F1111] border border-[#B7D31A]/40 rounded-xl text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors" />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-4 bg-[#B7D31A] text-[#050606] rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
        {loading ? <span className="w-5 h-5 border-2 border-[#050606] border-t-transparent rounded-full animate-spin" /> : <>Buscar pedido <ArrowRight size={16} /></>}
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </form>
  );
}
