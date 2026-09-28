'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFavoritosStore } from '@/store/favoritosStore';

/**
 * Al iniciar sesión trae los favoritos de la cuenta (y le suma los marcados
 * antes sin sesión). Al cerrarla los borra de este navegador, para que en una
 * computadora compartida no queden los de otra persona.
 */
export default function FavoritosSync() {
  const token = useAuthStore((s) => s.token);
  const tuvoSesion = useRef(false);

  useEffect(() => {
    if (token) {
      tuvoSesion.current = true;
      useFavoritosStore.getState().sincronizar();
    } else if (tuvoSesion.current) {
      tuvoSesion.current = false;
      useFavoritosStore.setState({ ids: [] });
    }
  }, [token]);

  return null;
}
