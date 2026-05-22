// InstagramSection — grilla de 7 fotos de Instagram
// En desktop: fila horizontal. En mobile: scroll horizontal
// Cada imagen placeholder muestra el ícono de Instagram y un gradiente

import Link from 'next/link';

const INSTAGRAM_POSTS = [
  { id: 1, bg: 'from-purple-900 to-pink-900', label: 'Paleta Babolat' },
  { id: 2, bg: 'from-emerald-900 to-teal-900', label: 'Zapatillas Adidas' },
  { id: 3, bg: 'from-blue-900 to-indigo-900', label: 'Entrenamiento' },
  { id: 4, bg: 'from-orange-900 to-red-900', label: 'Bolso Head' },
  { id: 5, bg: 'from-pink-900 to-rose-900', label: 'Ropa Bullpadel' },
  { id: 6, bg: 'from-slate-900 to-gray-900', label: 'Nueva temporada' },
  { id: 7, bg: 'from-violet-900 to-purple-900', label: 'Oferta especial' },
];

// Ícono de Instagram en SVG
function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function InstagramSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* ── Encabezado ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-[#C8FF00] rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#111]">
            Seguinos en Instagram
          </h2>
        </div>
        <a
          href="https://instagram.com/homepadel"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-[#C8FF00] bg-[#111] px-4 py-1.5 rounded-full hover:bg-[#222] transition-colors flex items-center gap-2"
        >
          <InstagramIcon size={14} />
          @homepadel
        </a>
      </div>

      {/* ── Grilla de imágenes ─────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {INSTAGRAM_POSTS.map((post) => (
          <a
            key={post.id}
            href="https://instagram.com/homepadel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden relative group cursor-pointer"
            aria-label={`Ver post: ${post.label}`}
          >
            {/* Fondo gradiente placeholder */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${post.bg} transition-transform duration-300 group-hover:scale-105`}
            />

            {/* Overlay en hover con ícono Instagram */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                <InstagramIcon size={28} />
              </div>
            </div>

            {/* Label de contenido */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-medium truncate">{post.label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* CTA de Instagram */}
      <div className="mt-5 text-center">
        <a
          href="https://instagram.com/homepadel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111] transition-colors font-medium"
        >
          <InstagramIcon size={16} />
          Ver más en Instagram
        </a>
      </div>
    </section>
  );
}
