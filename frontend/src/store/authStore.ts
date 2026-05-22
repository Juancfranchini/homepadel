// Store de autenticación con Zustand
// Persiste en localStorage bajo la clave 'homepadel-auth'
// Gestiona el usuario actual, token JWT y estado de sesión

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // Guarda usuario y token; también persiste el token en localStorage para Axios
      setAuth: (user, token) => {
        set({ user, token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },

      // Limpia sesión del store y de localStorage
      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },

      // Devuelve true si hay un token activo
      isAuthenticated: () => !!get().token,
    }),
    { name: 'homepadel-auth' }
  )
);
