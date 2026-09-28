'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { getFavoritos } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useFavoritosStore } from '@/store/favoritosStore';
import ProductCard from '@/components/ui/ProductCard';

/** Productos marcados con el corazón. Al desmarcar uno desaparece en el momento. */
export default function CuentaFavoritosTab() {
  const [productos, setProductos] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const ids = useFavoritosStore((s) => s.ids);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    getFavoritos().then(setProductos).catch(() => setError(true));
  }, []);

  const visibles = (productos ?? []).filter((p) => ids.includes(p.id));

  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-fg flex items-center gap-2 mb-5"><Heart size={20} className="text-brand-fg" />Favoritos</h2>
      {error ? (
        <p className="text-sm text-red-500 light:text-red-600 py-8 text-center">No pudimos cargar tus favoritos. Probá de nuevo en un rato.</p>
      ) : productos === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-72 bg-chip rounded-2xl animate-pulse" />)}</div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto text-chip mb-4" />
          <p className="text-fg-muted font-medium mb-1">Todavía no tenés productos favoritos</p>
          <p className="text-fg-muted text-sm">Tocá el corazón de un producto para guardarlo acá. <Link href="/catalogo" className="text-brand-fg font-semibold hover:underline">Ir al catálogo</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {visibles.map((producto) => <ProductCard key={producto.id} product={producto} onAddToCart={(p) => addItem(p)} />)}
        </div>
      )}
    </div>
  );
}
