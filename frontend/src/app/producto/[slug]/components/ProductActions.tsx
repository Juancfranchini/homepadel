'use client';

import { ShoppingCart, Heart, Zap, Minus, Plus, MessageCircle } from 'lucide-react';

interface Props {
  stock: number;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  added: boolean;
  wished: boolean;
  onWish: () => void;
}

export default function ProductActions({ stock, quantity, onQuantityChange, onBuyNow, onAddToCart, added, wished, onWish }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#C7C7C0]">Cantidad:</span>
        <div className="flex items-center bg-[#0C0C0C] border border-[#0D0F0F] rounded-xl overflow-hidden">
          <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))} disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/[0.04] transition-colors disabled:opacity-30">
            <Minus size={15} />
          </button>
          <span className="w-10 text-center font-semibold text-sm text-[#F7F6F7]">{quantity}</span>
          <button onClick={() => onQuantityChange(Math.min(stock || 99, quantity + 1))} disabled={quantity >= (stock || 99)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/[0.04] transition-colors disabled:opacity-30">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={onBuyNow} disabled={stock === 0}
          className="w-full py-4 rounded-xl bg-[#B7D31A] text-[#050606] font-semibold text-sm uppercase tracking-wider btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Zap size={16} />COMPRAR AHORA
        </button>

        <div className="flex gap-2">
          <button onClick={onAddToCart} disabled={stock === 0}
            className={'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm uppercase tracking-wider transition-all duration-200 ' +
              (stock === 0 ? 'border-[#0D0F0F] text-[#8A8A85] cursor-not-allowed' :
                added ? 'border-[#B7D31A] bg-[#B7D31A]/10 text-[#B7D31A]' :
                'border-[#0D0F0F] text-[#F7F6F7] hover:border-[#8A8A85] hover:bg-white/[0.04]')}>
            <ShoppingCart size={16} />
            {stock === 0 ? 'Sin stock' : added ? 'Agregado!' : 'AGREGAR AL CARRITO'}
          </button>
          <button onClick={onWish}
            className={'w-12 h-12 rounded-xl border flex items-center justify-center transition-all ' +
              (wished ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-[#0D0F0F] text-[#C7C7C0] hover:border-red-400 hover:text-red-400')}
            aria-label="Favoritos">
            <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
          </button>
        </div>

        <a href="https://wa.me/5491172345678?text=Hola! Me interesa este producto" target="_blank" rel="noopener noreferrer"
          className="w-full py-3 rounded-xl border border-[#0A2D3D] text-[#F7F6F7] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0A2D3D]/50 transition-colors">
          <MessageCircle size={16} />Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}