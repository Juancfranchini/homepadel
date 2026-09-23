'use client';

import { MessageCircle, Trash2, Check, Clock } from 'lucide-react';

export interface AbandonedCart {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  contactedAt: string | null;
  updatedAt: string;
}

/**
 * Arma el enlace de WhatsApp con el carrito ya escrito en el mensaje.
 *
 * wa.me exige solo dígitos y con código de país. Si el número ya trae el 54 se
 * respeta; si no, se asume Argentina. Sin teléfono no hay enlace: un botón que
 * no lleva a ningún lado es peor que no ofrecerlo.
 */
function enlaceWhatsapp(carrito: AbandonedCart): string | null {
  const digitos = (carrito.phone || '').replace(/\D/g, '');
  if (!digitos) return null;

  const numero = digitos.startsWith('54') ? digitos : '549' + digitos;
  const productos = carrito.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  const saludo = carrito.name ? `Hola ${carrito.name.split(' ')[0]}!` : 'Hola!';
  const mensaje = `${saludo} Te escribo de Home Pádel. Vimos que dejaste un pedido sin terminar (${productos}). ¿Te ayudamos a completarlo?`;

  return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje);
}

function hace(fecha: string): string {
  const horas = Math.floor((Date.now() - new Date(fecha).getTime()) / 3600000);
  if (horas < 1) return 'hace minutos';
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}

interface Props {
  carrito: AbandonedCart;
  onToggleContacted: () => void;
  onDelete: () => void;
}

export default function AbandonedCartRow({ carrito, onToggleContacted, onDelete }: Props) {
  const whatsapp = enlaceWhatsapp(carrito);
  const contactado = !!carrito.contactedAt;

  return (
    <div className={'bg-white border rounded-xl p-4 ' + (contactado ? 'border-gray-200 opacity-70' : 'border-gray-200')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{carrito.name || 'Sin nombre'}</p>
          <p className="text-xs text-gray-500">{carrito.email}{carrito.phone ? ' · ' + carrito.phone : ''}</p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {hace(carrito.updatedAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">$ {Math.round(carrito.total).toLocaleString('es-AR')}</p>
          <p className="text-[11px] text-gray-400">{carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-0.5 border-t border-gray-100 pt-3">
        {carrito.items.map((item, i) => (
          <li key={i} className="text-xs text-gray-600 flex justify-between gap-3">
            <span className="truncate">{item.quantity}x {item.name}</span>
            <span className="flex-none text-gray-400">$ {Math.round(item.price * item.quantity).toLocaleString('es-AR')}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Escribir por WhatsApp
          </a>
        ) : (
          <span className="text-[11px] text-gray-400">Sin teléfono cargado: no se puede contactar por WhatsApp</span>
        )}

        <button
          type="button"
          onClick={onToggleContacted}
          className={
            'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ' +
            (contactado
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50')
          }
        >
          <Check className="w-3.5 h-3.5" /> {contactado ? 'Contactado' : 'Marcar contactado'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="ml-auto p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
          title="Quitar de la lista"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
