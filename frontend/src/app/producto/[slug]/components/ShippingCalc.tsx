'use client';

import { useState } from 'react';
import { MapPin, Shield } from 'lucide-react';

export default function ShippingCalc() {
  const [postal, setPostal] = useState('');

  return (
    <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={14} className="text-[#B7D31A]" />
        <p className="text-sm font-semibold text-[#F7F6F7]">Calcula tu envio</p>
      </div>
      <div className="flex gap-2">
        <input type="text" value={postal} onChange={(e) => setPostal(e.target.value)}
          placeholder="Ingresa tu codigo postal"
          className="flex-1 bg-[#0A0F12] border border-[#0D0F0F] rounded-lg px-3 py-2 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A] focus:ring-1 focus:ring-[#B7D31A]/20" />
        <button className="px-4 py-2 bg-[#B7D31A] text-[#050606] rounded-lg text-xs font-semibold uppercase tracking-wide btn-primary-glow">
          Calcular
        </button>
      </div>
      <p className="text-[10px] text-[#8A8A85] mt-2 flex items-center gap-1">
        <Shield size={10} className="text-[#B7D31A]" />Compra protegida - Datos 100% seguros
      </p>
    </div>
  );
}