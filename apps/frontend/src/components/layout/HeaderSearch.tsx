'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

/** Buscador fijo en el header: se puede buscar desde cualquier página, sin tener que entrar primero a Productos. */
export default function HeaderSearch({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  // Se renderiza dos veces (escritorio y celular): cada una necesita su propio id.
  const id = useId();

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const q = texto.trim();
    if (!q) return;
    router.push('/catalogo?q=' + encodeURIComponent(q));
    onSearch?.();
  };

  return (
    <form onSubmit={buscar} role="search" className="flex w-full overflow-hidden rounded-lg border border-white/10 bg-[#1A1F21] focus-within:border-[#B7D31A]/60">
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <input
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscá paletas, marcas, zapatillas…"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none"
      />
      <button type="submit" aria-label="Buscar" className="flex items-center gap-2 bg-[#B7D31A] px-4 text-xs font-bold uppercase tracking-wide text-[#050606] transition-colors hover:bg-[#CAE52E]">
        <Search size={16} />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );
}
