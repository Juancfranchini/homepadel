/**
 * Orden del catálogo.
 *
 * El selector de orden del catálogo existía en la interfaz pero su valor nunca
 * llegaba a la API: el backend ordenaba siempre por fecha de creación. Como el
 * listado viene paginado, cualquier intento de ordenar del lado del navegador
 * habría reacomodado únicamente los doce productos visibles.
 *
 * Estas pruebas fijan el contrato entre las opciones del selector y la cláusula
 * que se le pasa a la base. Si alguien agrega una opción en el frontend sin
 * contemplarla acá, la lista sale ordenada por fecha sin avisar.
 */

import { resolveOrderBy } from './products.service';

describe('resolveOrderBy', () => {
  const casos: Array<[string, Record<string, 'asc' | 'desc'>]> = [
    ['featured', { featured: 'desc' }],
    ['price_asc', { price: 'asc' }],
    ['price_desc', { price: 'desc' }],
    ['newest', { createdAt: 'desc' }],
    ['name_asc', { name: 'asc' }],
  ];

  it.each(casos)('traduce "%s" a la cláusula correcta', (sort, esperado) => {
    expect(resolveOrderBy(sort)).toEqual(esperado);
  });

  const invalidos: Array<[string, unknown]> = [
    ['vacío', ''],
    ['ausente', undefined],
    ['nulo', null],
    ['desconocido', 'precio_descendente'],
    ['numérico', 42],
    ['con intención de inyectar', 'price; DROP TABLE products'],
  ];

  it.each(invalidos)('cae en el orden por defecto cuando el valor es %s', (_titulo, sort) => {
    // Importa que un valor arbitrario no llegue nunca a la cláusula: Prisma
    // rechazaría un campo inexistente y la búsqueda fallaría entera.
    expect(resolveOrderBy(sort)).toEqual({ createdAt: 'desc' });
  });

  it('cubre todas las opciones que ofrece el selector del catálogo', () => {
    // Espejo de SORT_OPTIONS en CatalogSort.tsx. Si allá se agrega una opción
    // y acá no, esta prueba lo señala antes de que el usuario vea una lista
    // que ignora lo que eligió.
    const opcionesDelSelector = ['featured', 'price_asc', 'price_desc', 'newest', 'name_asc'];
    const porDefecto = { createdAt: 'desc' };

    const sinSoporte = opcionesDelSelector.filter(
      (opcion) => opcion !== 'newest' && JSON.stringify(resolveOrderBy(opcion)) === JSON.stringify(porDefecto),
    );

    expect(sinSoporte).toEqual([]);
  });
});
