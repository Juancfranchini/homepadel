/**
 * Opciones de orden del catálogo — única fuente de verdad.
 *
 * Estaban duplicadas en el selector y en el panel lateral, y las dos copias
 * terminaron diciendo cosas distintas. Los valores tienen que coincidir con los
 * que acepta `resolveOrderBy()` en el backend: cualquier otro se ignora en
 * silencio y la lista sale ordenada por fecha.
 */
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Nuevos ingresos' },
  { value: 'name_asc', label: 'Nombre A-Z' },
] as const;

export const DEFAULT_SORT = 'newest';

/** Etiqueta legible del orden vigente, para mostrarla junto al control. */
export function sortLabel(value: string): string {
  return SORT_OPTIONS.find((option) => option.value === value)?.label ?? 'Ordenar';
}
