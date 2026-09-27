import { CategoriesService } from './categories.service';

type Marca = { id: string; name: string; slug: string; logo: string | null; order: number };

function servicio(
  categorias: { id: string; name: string; slug: string }[],
  pares: { categoryId: string; brand: Marca }[],
  generos: string[] = [],
) {
  const prisma = {
    category: { findMany: jest.fn().mockResolvedValue(categorias) },
    product: {
      // La primera consulta trae los pares categoría-marca; la segunda, los géneros.
      findMany: jest.fn((args: { distinct: string[] }) =>
        Promise.resolve(args.distinct.includes('gender') ? generos.map((gender) => ({ gender })) : pares),
      ),
    },
  };
  return new CategoriesService(prisma as never);
}

const NOX = { id: 'b-nox', name: 'Nox', slug: 'nox', logo: 'nox.png', order: 2 };
const ADIDAS = { id: 'b-adidas', name: 'Adidas', slug: 'adidas', logo: 'adidas.png', order: 1 };
const BULLPADEL = { id: 'b-bull', name: 'Bullpadel ', slug: 'bullpadel', logo: null, order: 1 };

describe('CategoriesService.findMenu', () => {
  it('cada categoría lista solo las marcas que tienen productos en ella', async () => {
    const { categorias } = await servicio(
      [
        { id: 'c-paletas', name: 'Paletas', slug: 'paletas' },
        { id: 'c-bolsos', name: 'Bolsos', slug: 'bolsos' },
      ],
      [
        { categoryId: 'c-paletas', brand: NOX },
        { categoryId: 'c-paletas', brand: ADIDAS },
        { categoryId: 'c-bolsos', brand: BULLPADEL },
      ],
    ).findMenu();

    expect(categorias[0].brands.map((b) => b.slug)).toEqual(['adidas', 'nox']);
    expect(categorias[1].brands.map((b) => b.slug)).toEqual(['bullpadel']);
  });

  it('ordena las marcas por su orden del backoffice y limpia espacios del nombre', async () => {
    const { categorias } = await servicio(
      [{ id: 'c-paletas', name: 'Paletas', slug: 'paletas' }],
      [
        { categoryId: 'c-paletas', brand: NOX },
        { categoryId: 'c-paletas', brand: BULLPADEL },
      ],
    ).findMenu();

    expect(categorias[0].brands).toEqual([
      { id: 'b-bull', name: 'Bullpadel', slug: 'bullpadel', logo: null },
      { id: 'b-nox', name: 'Nox', slug: 'nox', logo: 'nox.png' },
    ]);
  });

  it('una categoría sin productos queda con la lista de marcas vacía', async () => {
    const { categorias } = await servicio([{ id: 'c-zapatillas', name: 'Zapatillas', slug: 'zapatillas' }], []).findMenu();
    expect(categorias[0].brands).toEqual([]);
  });

  it('"marcas" junta las de todas las categorías, sin repetir', async () => {
    const { marcas } = await servicio(
      [
        { id: 'c-paletas', name: 'Paletas', slug: 'paletas' },
        { id: 'c-bolsos', name: 'Bolsos', slug: 'bolsos' },
      ],
      [
        { categoryId: 'c-paletas', brand: NOX },
        { categoryId: 'c-bolsos', brand: NOX },
        { categoryId: 'c-bolsos', brand: ADIDAS },
      ],
    ).findMenu();

    expect(marcas.map((m) => m.slug)).toEqual(['adidas', 'nox']);
  });

  it('devuelve los géneros que tienen productos cargados', async () => {
    const { generos } = await servicio([], [], ['Unisex', 'Mujer']).findMenu();
    expect(generos).toEqual(['Unisex', 'Mujer']);
  });
});
