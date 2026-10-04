import { generosConUnisex, listaDeValores, ProductsService } from './products.service';

function servicio() {
  const prisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      fields: { price: 'price' },
    },
  };
  return { prisma, service: new ProductsService(prisma as never) };
}

const filtroUsado = (prisma: ReturnType<typeof servicio>['prisma']) => prisma.product.findMany.mock.calls[0][0].where;

describe('filtros combinables del catálogo', () => {
  it('lee listas separadas por coma, sin vacíos ni repetidos', () => {
    expect(listaDeValores('nox, royal,,nox')).toEqual(['nox', 'royal']);
    expect(listaDeValores(['nox', 'royal'])).toEqual(['nox', 'royal']);
    expect(listaDeValores(undefined)).toEqual([]);
  });

  it('varias marcas: trae las de cualquiera de ellas', async () => {
    const { prisma, service } = servicio();
    await service.findAll({ brand: 'nox,royal' });
    expect(filtroUsado(prisma).brand).toEqual({ slug: { in: ['nox', 'royal'] } });
  });

  it('una sola marca sigue funcionando igual que antes', async () => {
    const { prisma, service } = servicio();
    await service.findAll({ brand: 'nox' });
    expect(filtroUsado(prisma).brand).toEqual({ slug: { in: ['nox'] } });
  });

  it('marcas, categorías, formato y nivel se combinan entre sí', async () => {
    const { prisma, service } = servicio();
    await service.findAll({ brand: 'nox,adidas', category: 'paletas', shape: 'Redondo,Hibrido', level: 'Avanzado' });
    expect(filtroUsado(prisma)).toMatchObject({
      active: true,
      brand: { slug: { in: ['nox', 'adidas'] } },
      category: { slug: { in: ['paletas'] } },
      shape: { in: ['Redondo', 'Hibrido'] },
      level: { in: ['Avanzado'] },
    });
  });

  it('varios talles: producto o variante activa con cualquiera de ellos', async () => {
    const { prisma, service } = servicio();
    await service.findAll({ size: '40,41' });
    expect(filtroUsado(prisma).AND).toContainEqual({
      OR: [{ size: { in: ['40', '41'] } }, { variants: { some: { size: { in: ['40', '41'] }, active: true } } }],
    });
  });

  it('hombre o mujer incluyen las paletas unisex; solo unisex trae solo esas', () => {
    expect(generosConUnisex(['Hombre'])).toEqual(['Hombre', 'Unisex']);
    expect(generosConUnisex(['Hombre', 'Mujer'])).toEqual(['Hombre', 'Mujer', 'Unisex']);
    expect(generosConUnisex(['Unisex'])).toEqual(['Unisex']);
  });
});
