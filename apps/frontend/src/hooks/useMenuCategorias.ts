'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export interface MarcaMenu {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface CategoriaMenu {
  id: string;
  name: string;
  slug: string;
  brands: MarcaMenu[];
}

// Una sola petición por visita: el header, el menú móvil y el pie la comparten.
let pedido: Promise<CategoriaMenu[]> | null = null;

function cargarMenu(): Promise<CategoriaMenu[]> {
  pedido ??= api
    .get<CategoriaMenu[]>('/categories/menu')
    // Una categoría sin marcas es una categoría sin productos activos: llevaría
    // a un listado vacío. Aparece sola cuando se le cargue el primer producto.
    .then((r) => (Array.isArray(r.data) ? r.data.filter((c) => c.brands.length > 0) : []))
    .catch(() => {
      pedido = null; // si falló, que el próximo intento vuelva a pedirlo
      return [];
    });
  return pedido;
}

/** Categorías con productos, cada una con sus marcas. Vacío mientras carga o si la API no responde. */
export function useMenuCategorias(): CategoriaMenu[] {
  const [categorias, setCategorias] = useState<CategoriaMenu[]>([]);

  useEffect(() => {
    let vigente = true;
    cargarMenu().then((c) => { if (vigente) setCategorias(c); });
    return () => { vigente = false; };
  }, []);

  return categorias;
}
