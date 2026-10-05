import { BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

function servicio({ previa = null, pedido = null }: { previa?: unknown; pedido?: unknown } = {}) {
  const prisma = {
    productReview: {
      create: jest.fn(async ({ data }) => ({ id: 'review-1', ...data })),
      findFirst: jest.fn().mockResolvedValue(previa),
      findUnique: jest.fn().mockResolvedValue({ id: 'review-1' }),
      update: jest.fn(async ({ data }) => data),
    },
    user: { findUnique: jest.fn().mockResolvedValue({ email: 'cliente@gmail.com' }) },
    order: { findFirst: jest.fn().mockResolvedValue(pedido) },
  };
  return { prisma, service: new ReviewsService(prisma as never) };
}

const RESENA = { productId: 'product-1', name: 'Valentina', rating: 4, comment: 'Muy buena paleta.', userId: 'user-1' };

describe('ReviewsService', () => {
  it('con una compra cobrada de ese producto, la reseña queda como compra verificada (pendiente de aprobar)', async () => {
    const { prisma, service } = servicio({ pedido: { id: 'o-1' } });
    await service.create(RESENA);
    expect(prisma.productReview.create).toHaveBeenCalledWith({
      data: { productId: 'product-1', name: 'Valentina', rating: 4, comment: 'Muy buena paleta.', userId: 'user-1', verified: true, active: false },
    });
  });

  it('sin compra, la reseña se guarda pero no como verificada', async () => {
    const { prisma, service } = servicio({ pedido: null });
    await service.create(RESENA);
    expect(prisma.productReview.create.mock.calls[0][0].data.verified).toBe(false);
  });

  it('busca la compra cobrada, no de prueba, por la cuenta o por su mail en el checkout', async () => {
    const { prisma, service } = servicio();
    await service.create(RESENA);
    const where = prisma.order.findFirst.mock.calls[0][0].where;
    expect(where).toMatchObject({ status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, isTest: false, items: { some: { productId: 'product-1' } } });
    expect(where.OR).toEqual([{ userId: 'user-1' }, { notes: { contains: '"buyerEmail":"cliente@gmail.com"', mode: 'insensitive' } }]);
  });

  it('una sola reseña por persona y producto', async () => {
    const { prisma, service } = servicio({ previa: { id: 'r-0' } });
    await expect(service.create(RESENA)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.productReview.create).not.toHaveBeenCalled();
  });

  it('el backoffice no puede marcarla verificada a mano: ese campo se ignora', async () => {
    const { prisma, service } = servicio();
    await service.update('review-1', { comment: 'Texto corregido por la tienda.', verified: true, active: true });
    expect(prisma.productReview.update).toHaveBeenCalledWith({ where: { id: 'review-1' }, data: { comment: 'Texto corregido por la tienda.', active: true } });
  });
});
