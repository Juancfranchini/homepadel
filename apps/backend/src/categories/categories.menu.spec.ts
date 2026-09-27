import { CategoriesService } from './categories.service';

function servicio(
  categorias: { id: string; name: string; slug: string }[],
  pares: { categoryId: string; brand: { id: string; name: string; slug: string; logo: string | null; order: number } }[],
) {
  const prisma = {
    category: { findMany: jest.fn().mockResolvedValue(categorias) },
    product: { findMany: jest.fn().mockResolvedValue(pares) },
  };
  return new CategoriesService(prisma as never);
}

const NOX = { id: 'b-nox', name: 'Nox', slug: 'nox', logo: 'nox.png', order: 2 };
const ADIDAS = { id: 'b-adidas', name: 'Adidas', slug: 'adidas', logo: 'adidas.png', order: 1 };
const BULLPADEL = { id: 'b-bull', name: 'Bullpadel ', slug: 'bullpadel', logo: null, order: 1 };

describe('CategoriesService.findMenu', () => {
  it('cada categoría lista solo las marcas que tienen productos en ella', async () => {
    const menu = await servicio(
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

    expect(menu[0].brands.map((b) => b.slug)).toEqual(['adidas', 'nox']);
    expect(menu[1].brands.map((b) => b.slug)).toEqual(['bullpadel']);
  });

  it('ordena las marcas por su orden del backoffice y limpia espacios del nombre', async () => {
    const menu = await servicio(
      [{ id: 'c-paletas', name: 'Paletas', slug: 'paletas' }],
      [
        { categoryId: 'c-paletas', brand: NOX },
        { categoryId: 'c-paletas', brand: BULLPADEL },
      ],
    ).findMenu();

    expect(menu[0].brands).toEqual([
      { id: 'b-bull', name: 'Bullpadel', slug: 'bullpadel', logo: null },
      { id: 'b-nox', name: 'Nox', slug: 'nox', logo: 'nox.png' },
    ]);
  });

  it('una categoría sin productos queda con la lista de marcas vacía', async () => {
    const menu = await servicio([{ id: 'c-zapatillas', name: 'Zapatillas', slug: 'zapatillas' }], []).findMenu();
    expect(menu[0].brands).toEqual([]);
  });
});
