import { InstagramConfig } from '@/types';

const FALLBACK: InstagramConfig = {
  title: 'Seguinos en Instagram',
  username: '@homepadel',
  buttonText: 'Ver perfil',
  buttonUrl: 'https://instagram.com/homepadel',
};

const PLACEHOLDER_POSTS = [
  { id: 1, bg: 'from-purple-900 to-pink-900' },
  { id: 2, bg: 'from-emerald-900 to-teal-900' },
  { id: 3, bg: 'from-blue-900 to-indigo-900' },
  { id: 4, bg: 'from-orange-900 to-red-900' },
  { id: 5, bg: 'from-pink-900 to-rose-900' },
  { id: 6, bg: 'from-slate-800 to-gray-900' },
  { id: 7, bg: 'from-violet-900 to-purple-900' },
];

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

interface Props {
  config?: InstagramConfig | null;
}

export default function InstagramSection({ config }: Props) {
  const ig = config ?? FALLBACK;

  return (
    <section className="bg-[#111] border-t border-white/5 py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 bg-[#C8FF00] rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              {ig.title}
            </h2>
          </div>
          <a
            href={ig.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white bg-white/10 border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <InstagramIcon size={14} />
            {ig.username}
          </a>
        </div>

        {/* Grilla de placeholders */}
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {PLACEHOLDER_POSTS.map((post) => (
            <a
              key={post.id}
              href={ig.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden relative group cursor-pointer"
              aria-label={`Ver perfil de Instagram de ${ig.username}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${post.bg} transition-transform duration-300 group-hover:scale-105`} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                  <InstagramIcon size={28} />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a
            href={ig.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-medium"
          >
            <InstagramIcon size={16} />
            {ig.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
