import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  it('guarda una reseña de producto como verificada pero pendiente', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'review-1', active: false });
    const service = new ReviewsService({ productReview: { create } } as never);

    await service.create({ productId: 'product-1', name: 'Valentina', rating: 4, comment: 'Muy buena paleta.', userId: 'user-1' });

    expect(create).toHaveBeenCalledWith({
      data: {
        productId: 'product-1',
        name: 'Valentina',
        rating: 4,
        comment: 'Muy buena paleta.',
        userId: 'user-1',
        verified: true,
        active: false,
      },
    });
  });
});
