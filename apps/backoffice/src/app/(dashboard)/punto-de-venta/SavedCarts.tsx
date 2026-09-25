import { Clock3 } from 'lucide-react';
import { SavedCart } from './types';

export function SavedCarts({
  carts,
  onResume,
}: {
  carts: SavedCart[];
  onResume: (cart: SavedCart) => void;
}) {
  if (!carts.length) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
        <Clock3 className="h-4 w-4" /> Carritos guardados
      </p>
      <div className="flex flex-wrap gap-2">
        {carts.map((cart) => (
          <button
            type="button"
            key={cart.id}
            onClick={() => onResume(cart)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-left text-xs text-amber-900 hover:border-amber-400"
          >
            <span className="block font-semibold">{cart.name}</span>
            <span>
              {cart.items.length} productos · {cart.channel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
