/** El corazón guarda el producto en la cuenta; solo productos activos y sin repetir. */
import { NotFoundException } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { PrismaService } from '../prisma/prisma.service';

function fakePrisma(activos: string[]) {
  return {
    product: {
      findFirst: jest.fn(async ({ where }) => (activos.includes(where.id) ? { id: where.id } : null)),
      findMany: jest.fn(async ({ where }) => activos.filter((id) => where.id.in.includes(id)).map((id) => ({ id }))),
    },
    favorite: {
      upsert: jest.fn(async () => ({})),
      deleteMany: jest.fn(async () => ({ count: 1 })),
      createMany: jest.fn(async () => ({ count: 0 })),
      findMany: jest.fn(async () => [{ productId: 'p1' }]),
    },
  } as unknown as PrismaService;
}

describe('FavoritosService', () => {
  it('marca un producto activo sin duplicarlo (upsert)', async () => {
    const prisma = fakePrisma(['p1']);
    await new FavoritosService(prisma).agregar('u1', 'p1');
    expect(prisma.favorite.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_productId: { userId: 'u1', productId: 'p1' } } }));
  });

  it('no deja marcar un producto inexistente o dado de baja', async () => {
    const prisma = fakePrisma([]);
    await expect(new FavoritosService(prisma).agregar('u1', 'p9')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('al iniciar sesión suma los favoritos marcados antes, ignorando los que ya no existen', async () => {
    const prisma = fakePrisma(['p1', 'p2']);
    const ids = await new FavoritosService(prisma).sincronizar('u1', ['p1', 'p2', 'p2', 'viejo']);
    expect(prisma.favorite.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'u1', productId: 'p1' }, { userId: 'u1', productId: 'p2' }],
      skipDuplicates: true,
    });
    expect(ids).toEqual(['p1']);
  });
});
