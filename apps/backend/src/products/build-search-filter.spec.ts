/**
 * Búsqueda por texto del catálogo.
 *
 * Por qué existe: la búsqueda miraba únicamente el nombre del producto.
 * Escribir "royal" devolvía cero resultados aunque hubiera 17 paletas de esa
 * marca, porque ninguna se llama "royal". Lo mismo con "bolso" o con un SKU.
 */

import { buildSearchFilter, palabrasDeBusqueda } from './products.search';

/** Los campos contra los que se compara una palabra. */
function camposDe(filtro: any, indicePalabra = 0): string[] {
  return filtro.AND[indicePalabra].OR.map((c: any) => Object.keys(c)[0]);
}

describe('buildSearchFilter', () => {
  it('no filtra nada cuando no se buscó nada', () => {
    expect(buildSearchFilter(undefined)).toBeNull();
    expect(buildSearchFilter('')).toBeNull();
    expect(buildSearchFilter('   ')).toBeNull();
  });

  it('busca por marca, no solo por nombre: es el caso que fallaba', () => {
    const filtro: any = buildSearchFilter('royal');
    expect(camposDe(filtro)).toContain('brand');
    expect(filtro.AND[0].OR).toContainEqual({
      brand: { name: { contains: 'royal', mode: 'insensitive' } },
    });
  });

  it('busca también por categoría, descripción y SKU', () => {
    expect(camposDe(buildSearchFilter('bolso'))).toEqual(
      expect.arrayContaining(['name', 'description', 'sku', 'brand', 'category']),
    );
  });

  it('exige que cada palabra aparezca, para que "bolso nox" no traiga todos los bolsos', () => {
    const filtro: any = buildSearchFilter('bolso nox');
    expect(filtro.AND).toHaveLength(2);
    expect(filtro.AND[0].OR[0]).toEqual({ name: { contains: 'bolso', mode: 'insensitive' } });
    expect(filtro.AND[1].OR[0]).toEqual({ name: { contains: 'nox', mode: 'insensitive' } });
  });

  it('ignora los espacios de más', () => {
    const filtro: any = buildSearchFilter('  royal   padel  ');
    expect(filtro.AND).toHaveLength(2);
  });

  it('no compara distinguiendo mayúsculas', () => {
    const filtro: any = buildSearchFilter('ROYAL');
    for (const campo of filtro.AND[0].OR) {
      const comparacion = Object.values(campo)[0] as any;
      const hoja = comparacion.contains ? comparacion : comparacion.name;
      expect(hoja.mode).toBe('insensitive');
    }
  });

  it('corta en seis palabras: una frase larga no debe armar una consulta enorme', () => {
    const filtro: any = buildSearchFilter('una dos tres cuatro cinco seis siete ocho');
    expect(filtro.AND).toHaveLength(6);
  });
});

/**
 * La búsqueda sin acentos usa la extensión `unaccent` de Postgres y no se
 * puede ejercitar sin base. Lo que sí se comprueba acá es el troceo en
 * palabras que comparten las dos variantes, y que el filtro con tildes —el
 * respaldo cuando la extensión no está— siga funcionando.
 */
describe('palabrasDeBusqueda', () => {
  it('trocea por espacios y descarta los sobrantes', () => {
    expect(palabrasDeBusqueda('  royal   padel  ')).toEqual(['royal', 'padel']);
  });

  it('corta en seis palabras', () => {
    expect(palabrasDeBusqueda('una dos tres cuatro cinco seis siete')).toHaveLength(6);
  });

  it('devuelve vacío cuando no hay nada que buscar', () => {
    expect(palabrasDeBusqueda('   ')).toEqual([]);
    expect(palabrasDeBusqueda(undefined)).toEqual([]);
  });
});
