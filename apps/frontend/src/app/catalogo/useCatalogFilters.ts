'use client';

import { useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { alternarValor, parseCatalogFilters, valoresDe } from './catalogQuery';

const ETIQUETA_FORMATO: Record<string, string> = { Lagrima: 'Lágrima', Hibrido: 'Híbrido' };
export const etiquetaFormato = (valor: string) => ETIQUETA_FORMATO[valor] ?? valor;

function textoRangoPrecio(min: number | null, max: number | null): string {
  if (min != null && max != null) return formatPrice(min) + ' – ' + formatPrice(max);
  if (min != null) return 'desde ' + formatPrice(min);
  return 'hasta ' + formatPrice(max as number);
}

/**
 * Filtros del catálogo, leídos de la URL.
 *
 * Cambiar un filtro cambia la URL y el servidor vuelve a armar el listado
 * (ver page.tsx). La navegación va dentro de una transición: mientras el
 * servidor responde, `isPending` deja mostrar el esqueleto en vez de dejar
 * la grilla vieja como si nada hubiera pasado.
 */
interface NombresDeFiltros {
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
}

/** El nombre visible de un slug ("royal-padel" → "Royal Pádel"); el slug si todavía no cargó la lista. */
const nombreDe = (lista: { slug: string; name: string }[] | undefined, slug: string) =>
  lista?.find((x) => x.slug === slug)?.name.trim() ?? slug;

export function useCatalogFilters(nombres?: NombresDeFiltros) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filters = parseCatalogFilters((clave) => searchParams.get(clave));
  const {
    selectedCategory, selectedBrand, isOffer, searchQuery, selectedSize, selectedColor,
    selectedWeight, selectedShape, selectedGender, selectedLevel, minPrice, maxPrice,
  } = filters;

  const navegar = (url: string) => startTransition(() => router.push(url));
  const refresh = () => startTransition(() => router.refresh());

  // Varios a la vez en un solo cambio de URL: llamar dos veces a setParam
  // (desde y hasta) hacía que el segundo pisara al primero.
  const setParams = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    for (const [key, value] of Object.entries(cambios)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    navegar('/catalogo?' + params.toString());
  };
  const setParam = (key: string, value: string | null) => setParams({ [key]: value });

  const clearFilters = () => navegar('/catalogo');
  const hasFilters = !!selectedCategory || !!selectedBrand || isOffer || !!searchQuery || !!selectedSize || !!selectedColor
    || !!selectedWeight || !!selectedShape || !!selectedGender || !!selectedLevel || minPrice != null || maxPrice != null;

  const activeChips: { label: string; onRemove: () => void }[] = [];
  // Un chip por valor: con dos marcas elegidas se puede sacar una sola.
  const chips = (seleccion: string, param: string, etiqueta: (valor: string) => string) => {
    for (const valor of valoresDe(seleccion)) {
      activeChips.push({ label: etiqueta(valor), onRemove: () => setParam(param, alternarValor(seleccion, valor)) });
    }
  };
  if (isOffer) activeChips.push({ label: 'Ofertas', onRemove: () => setParam('oferta', null) });
  chips(selectedCategory, 'categoria', (v) => nombreDe(nombres?.categories, v));
  chips(selectedBrand, 'marca', (v) => nombreDe(nombres?.brands, v));
  chips(selectedSize, 'talle', (v) => 'Talle: ' + v);
  chips(selectedColor, 'color', (v) => 'Color: ' + v);
  if (selectedWeight) activeChips.push({ label: 'Peso: ' + selectedWeight, onRemove: () => setParam('peso', null) });
  chips(selectedShape, 'formato', (v) => 'Formato: ' + etiquetaFormato(v));
  chips(selectedGender, 'genero', (v) => 'Género: ' + v);
  chips(selectedLevel, 'nivel', (v) => 'Nivel: ' + v);
  if (minPrice != null || maxPrice != null) {
    activeChips.push({ label: 'Precio: ' + textoRangoPrecio(minPrice, maxPrice), onRemove: () => setParams({ desde: null, hasta: null }) });
  }
  if (searchQuery) activeChips.push({ label: '"' + searchQuery + '"', onRemove: () => setParam('q', null) });

  const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
  // Entrando desde "Hombre" o "Mujer" del menú, el título lo dice.
  const enTitulo = (seleccion: string) => valoresDe(seleccion).map(capitalizar).join(' y ');
  const pageTitle = isOffer ? 'Ofertas' : selectedCategory ? enTitulo(selectedCategory)
    : selectedGender ? enTitulo(selectedGender) : 'Catálogo';

  return {
    ...filters,
    setParam, setParams, clearFilters, refresh, isPending, hasFilters, activeChips, pageTitle,
  };
}
