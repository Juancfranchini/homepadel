'use client';

import { useState, useEffect } from 'react';
import { InstagramConfig } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface InstagramPost {
  id: string;
  url: string;
  thumbnail_url: string;
  author_name: string;
  html?: string;
}

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

/**
 * Publicaciones de Instagram en el inicio.
 *
 * Son las que la tienda carga a mano desde el backoffice, con su enlace y su
 * miniatura. No se traen solas del perfil: para eso hace falta una app de Meta
 * aprobada, que no se tramitó.
 *
 * Antes, cuando no había ninguna, se dibujaban seis recuadros de relleno con
 * etiquetas inventadas —"Padel", "Equipo", "Cancha"— que no llevaban a ninguna
 * publicación real. Ahora, sin publicaciones cargadas, queda solo el
 * encabezado con el enlace al perfil; y sin datos de la sección, no se muestra
 * nada.
 */
export default function InstagramSection({ config }: Props) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    fetch(API_URL + '/instagram/posts?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sin título ni enlace al perfil no hay nada real que mostrar. Antes se
  // rellenaba con un usuario y una cuenta inventados.
  const ig = config;
  if (!ig?.title?.trim() || !ig?.buttonUrl?.trim()) return null;

  return (
    <section className="section-gradient bg-[#030F14] border-t border-[#0D0F0F] py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#B7D31A] to-[#1699D3] flex items-center justify-center">
              <InstagramIcon size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-2xl md:text-3xl font-semibold uppercase text-[#F7F6F7]">{ig.title}</h2>
              <p className="text-[#C7C7C0] text-xs sm:text-sm">{ig.username}</p>
            </div>
          </div>
          <a href={ig.buttonUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-[#F7F6F7] bg-[#0A2D3D] hover:bg-[#0D3D52] px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
            <InstagramIcon size={14} />{ig.buttonText}
          </a>
        </div>

        {posts.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3">
            {posts.map((post) => (
              <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer bg-[#0C0C0C]"
                aria-label="Ver publicación en Instagram">
                <img src={post.thumbnail_url} alt="" loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                    <InstagramIcon size={30} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
