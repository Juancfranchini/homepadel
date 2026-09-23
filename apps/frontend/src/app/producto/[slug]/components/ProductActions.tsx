'use client';

import { trackMetaEvent } from '@/lib/metaPixel';
import { useSiteSettings, buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { ShoppingCart, Heart, Zap, Minus, Plus, MessageCircle } from 'lucide-react';

interface Props {
  stock: number;
  /** Con reserva activada se puede comprar siempre: el stock no interviene. */
  isMadeToOrder?: boolean;
  productName: string;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  added: boolean;
  wished: boolean;
  onWish: () => void;
}

export default function ProductActions({ stock, isMadeToOrder, productName, quantity, onQuantityChange, onBuyNow, onAddToCart, added, wished, onWish }: Props) {
  // Con la reserva activada el stock no se mira, valga lo que valga: si el
  // producto está publicado con esa opción es porque la tienda puede tomar la
  // seña y traerlo. El stock que se lleva es el del local, y no tiene nada que
  // ver con lo que se encarga afuera. Antes la ficha miraba solo el stock y
  // daba por agotado justo lo que está pensado para venderse sin tenerlo.
  const sinStock = !isMadeToOrder && stock === 0;
  const tope = isMadeToOrder ? 99 : stock || 99;

  const { whatsapp } = useSiteSettings();
  // El número estaba escrito a mano en el código, y era otro distinto del
  // configurado en el backoffice: las consultas iban a un teléfono ajeno.
  const consulta = buildWhatsappUrl(whatsapp, 'Hola! Me interesa "' + productName + '".');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base sm:text-sm font-semibold text-[#F7F6F7]">Cantidad:</span>
        <div className="flex items-center bg-[#1A1F21] border border-[#0D0F0F] rounded-xl overflow-hidden flex-1 max-w-[180px]">
          <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))} disabled={quantity <= 1}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-white/[0.04] transition-colors disabled:opacity-30">
            <Minus size={15} />
          </button>
          <span className="flex-1 text-center font-bold text-lg sm:text-base text-[#F7F6F7]">{quantity}</span>
          <button onClick={() => onQuantityChange(Math.min(tope, quantity + 1))} disabled={quantity >= tope}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-white/[0.04] transition-colors disabled:opacity-30">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={onBuyNow} disabled={sinStock}
          className="w-full py-3.5 sm:py-4 rounded-xl bg-[#B7D31A] text-[#050606] font-semibold text-sm sm:text-base uppercase tracking-wider btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Zap size={16} />{isMadeToOrder ? 'RESERVAR AHORA' : 'COMPRAR AHORA'}
        </button>

        <div className="flex gap-2">
          <button onClick={onAddToCart} disabled={sinStock}
            className={'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm uppercase tracking-wider transition-all duration-200 ' +
              (sinStock ? 'border-[#0D0F0F] text-[#8A8A85] cursor-not-allowed' :
                added ? 'border-[#B7D31A] bg-[#B7D31A]/10 text-[#B7D31A]' :
                'border-[#8A8A85] text-[#F7F6F7] hover:border-[#B7D31A] hover:text-[#B7D31A]')}>
            <ShoppingCart size={16} />
            {sinStock ? 'Sin stock' : added ? 'Agregado!' : 'AGREGAR AL CARRITO'}
          </button>
          <button onClick={onWish}
            className={'w-12 h-12 rounded-xl border flex items-center justify-center transition-all ' +
              (wished ? 'border-[#B7D31A] bg-[#B7D31A]/10 text-[#B7D31A]' : 'border-[#8A8A85] text-[#C7C7C0] hover:border-[#B7D31A] hover:text-[#B7D31A]')}
            aria-label="Favoritos">
            <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Sin número cargado no se dibuja el botón: llevaba a un teléfono
            que no es el de la tienda. */}
        {consulta && (
          <a href={consulta} target="_blank" rel="noopener noreferrer" onClick={() => trackMetaEvent("Contact", { content_type: "whatsapp" })}
            className="w-full py-2.5 sm:py-3 rounded-xl border border-[#0A2D3D] bg-[#0A2D3D]/50 text-[#F7F6F7] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#0A2D3D] transition-colors">
            <MessageCircle size={16} />Consultar por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}