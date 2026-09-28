// Favoritos (el corazón de los productos).
// Con sesión se guardan en la cuenta; sin sesión quedan en este navegador y se
// suman a la cuenta cuando la persona inicia sesión (ver FavoritosSync).

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { agregarFavorito, getFavoritosIds, quitarFavorito, sincronizarFavoritos } from '@/lib/api';
import { useAuthStore } from './authStore';

interface FavoritosStore {
  ids: string[];
  /** Carga los de la cuenta y le suma los marcados sin sesión. */
  sincronizar: () => Promise<void>;
  alternar: (productId: string) => Promise<void>;
  esFavorito: (productId: string) => boolean;
}

const conSesion = () => Boolean(useAuthStore.getState().token);

export const useFavoritosStore = create<FavoritosStore>()(
  persist(
    (set, get) => ({
      ids: [],

      sincronizar: async () => {
        if (!conSesion()) return;
        try {
          const locales = get().ids;
          const ids = locales.length > 0 ? await sincronizarFavoritos(locales) : await getFavoritosIds();
          set({ ids });
        } catch {
          // Sin conexión con la API: se quedan los que ya había.
        }
      },

      // Cambio optimista: el corazón responde al instante y se revierte si la API falla.
      alternar: async (productId) => {
        const estaba = get().ids.includes(productId);
        set({ ids: estaba ? get().ids.filter((id) => id !== productId) : [...get().ids, productId] });
        if (!conSesion()) return;
        try {
          await (estaba ? quitarFavorito(productId) : agregarFavorito(productId));
        } catch {
          set({ ids: estaba ? [...get().ids, productId] : get().ids.filter((id) => id !== productId) });
        }
      },

      esFavorito: (productId) => get().ids.includes(productId),
    }),
    { name: 'homepadel-favoritos', partialize: (state) => ({ ids: state.ids }) },
  ),
);

/** Para los botones de corazón: si está marcado y cómo cambiarlo. */
export function useFavorito(productId: string | undefined) {
  // Hasta montar se muestra vacío: el servidor no conoce los favoritos y el
  // primer dibujo tiene que coincidir con el suyo.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const marcado = useFavoritosStore((s) => (productId ? s.ids.includes(productId) : false));
  const alternar = useFavoritosStore((s) => s.alternar);
  return { marcado: montado && marcado, alternar: () => (productId ? alternar(productId) : undefined) };
}
