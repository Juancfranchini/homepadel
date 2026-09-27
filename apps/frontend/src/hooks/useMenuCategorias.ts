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

export interface MenuNavegacion {
  categorias: CategoriaMenu[];
  /** Todas las marcas con algún producto activo. */
  marcas: MarcaMenu[];
  /** Géneros que tienen productos cargados (Hombre, Mujer, Unisex). */
  generos: string[];
}

const VACIO: MenuNavegacion = { categorias: [], marcas: [], generos: [] };

type Respuesta = CategoriaMenu[] | Partial<MenuNavegacion>;

function normalizar(data: Respuesta): MenuNavegacion {
  // Frontend y backend se publican por separado: la versión anterior del
  // backend devolvía solo la lista de categorías.
  const categorias = Array.isArray(data) ? data : data?.categorias ?? [];
  const marcasDeCategorias = [...new Map(categorias.flatMap((c) => c.brands).map((m) => [m.id, m])).values()];
  return {
    // Una categoría sin marcas es una categoría sin productos activos: llevaría
    // a un listado vacío. Aparece sola cuando se le cargue el primer producto.
    categorias: categorias.filter((c) => c.brands.length > 0),
    marcas: Array.isArray(data) ? marcasDeCategorias : data?.marcas ?? marcasDeCategorias,
    generos: Array.isArray(data) ? [] : data?.generos ?? [],
  };
}

// Una sola petición por visita: el header, el menú móvil y el pie la comparten.
let pedido: Promise<MenuNavegacion> | null = null;

function cargarMenu(): Promise<MenuNavegacion> {
  pedido ??= api
    .get<Respuesta>('/categories/menu')
    .then((r) => normalizar(r.data))
    .catch(() => {
      pedido = null; // si falló, que el próximo intento vuelva a pedirlo
      return VACIO;
    });
  return pedido;
}

/** Categorías, marcas y géneros para la navegación. Vacío mientras carga o si la API no responde. */
export function useMenuNavegacion(): MenuNavegacion {
  const [menu, setMenu] = useState<MenuNavegacion>(VACIO);

  useEffect(() => {
    let vigente = true;
    cargarMenu().then((m) => { if (vigente) setMenu(m); });
    return () => { vigente = false; };
  }, []);

  return menu;
}

/** Solo las categorías con productos, cada una con sus marcas. */
export function useMenuCategorias(): CategoriaMenu[] {
  return useMenuNavegacion().categorias;
}

/**
 * Accesos por género. Una paleta unisex le sirve a los dos, así que "Hombre"
 * y "Mujer" aparecen si hay productos de ese género o unisex (el backend las
 * incluye al filtrar).
 */
export function accesosPorGenero(generos: string[]): { label: string; href: string }[] {
  const hayUnisex = generos.includes('Unisex');
  return ['Hombre', 'Mujer']
    .filter((g) => hayUnisex || generos.includes(g))
    .map((g) => ({ label: g, href: '/catalogo?genero=' + g }));
}
