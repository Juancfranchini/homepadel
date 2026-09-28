import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CarritoEmpty() {
  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-fg mb-8">Mi carrito</h1>
        <div className="bg-panel rounded-2xl border border-[#B7D31A]/20 p-16 text-center">
          <ShoppingBag size={56} className="mx-auto text-chip mb-5" />
          <h2 className="text-xl font-bold text-fg-muted mb-2">Tu carrito esta vacio</h2>
          <p className="text-fg-muted text-sm mb-8">Todavia no agregaste productos. Explora nuestro catálogo!</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors">
            Ver catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
