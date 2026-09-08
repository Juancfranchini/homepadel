import Link from 'next/link';

export default function CheckoutEmptyCart() {
  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#8A8A85] mb-4">Tu carrito esta vacio</p>
        <Link href="/catalogo" className="bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Ir al catálogo</Link>
      </div>
    </div>
  );
}
