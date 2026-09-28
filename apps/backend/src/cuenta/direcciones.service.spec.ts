/**
 * Cada cliente guarda hasta 3 direcciones y solo puede ver o tocar las suyas:
 * el id de otra persona tiene que dar "no encontrada", nunca editarla.
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { PrismaService } from '../prisma/prisma.service';

const DTO = { label: ' Casa ', street: 'Belgrano 1234', city: 'San Miguel', province: 'Buenos Aires', postalCode: '1663', phone: '' };

function fakePrisma(existentes: { id: string; userId: string }[]) {
  return {
    userAddress: {
      count: jest.fn(async ({ where }) => existentes.filter((d) => d.userId === where.userId).length),
      create: jest.fn(async ({ data }) => ({ id: 'nueva', ...data })),
      findFirst: jest.fn(async ({ where }) => existentes.find((d) => d.id === where.id && d.userId === where.userId) ?? null),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
      deleteMany: jest.fn(async ({ where }) => ({ count: existentes.filter((d) => d.id === where.id && d.userId === where.userId).length })),
      findMany: jest.fn(async () => []),
    },
  } as unknown as PrismaService;
}

describe('DireccionesService', () => {
  it('guarda una dirección nueva limpiando espacios y vacíos', async () => {
    const prisma = fakePrisma([]);
    await new DireccionesService(prisma).crear('u1', DTO);
    expect(prisma.userAddress.create).toHaveBeenCalledWith({
      data: { label: 'Casa', street: 'Belgrano 1234', city: 'San Miguel', province: 'Buenos Aires', postalCode: '1663', phone: null, userId: 'u1' },
    });
  });

  it('no deja guardar una cuarta dirección', async () => {
    const prisma = fakePrisma([1, 2, 3].map((n) => ({ id: 'd' + n, userId: 'u1' })));
    await expect(new DireccionesService(prisma).crear('u1', DTO)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.userAddress.create).not.toHaveBeenCalled();
  });

  it('las direcciones de otra persona no cuentan para el límite', async () => {
    const prisma = fakePrisma([1, 2, 3].map((n) => ({ id: 'd' + n, userId: 'otro' })));
    await new DireccionesService(prisma).crear('u1', DTO);
    expect(prisma.userAddress.create).toHaveBeenCalled();
  });

  it('no deja editar ni borrar una dirección ajena', async () => {
    const prisma = fakePrisma([{ id: 'd1', userId: 'otro' }]);
    const service = new DireccionesService(prisma);
    await expect(service.actualizar('u1', 'd1', DTO)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.borrar('u1', 'd1')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.userAddress.update).not.toHaveBeenCalled();
  });

  it('edita una dirección propia', async () => {
    const prisma = fakePrisma([{ id: 'd1', userId: 'u1' }]);
    const actualizada = await new DireccionesService(prisma).actualizar('u1', 'd1', { ...DTO, city: 'Moreno' });
    expect(actualizada.city).toBe('Moreno');
  });
});
