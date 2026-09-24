import { TestimonialsService } from './testimonials.service';

describe('TestimonialsService', () => {
  it('guarda las reseñas públicas pendientes de moderación', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'testimonial-1', active: false });
    const service = new TestimonialsService({ testimonial: { create } } as never);

    await service.createPublic({ name: 'Valentina', comment: 'Excelente atención y producto.', rating: 5 });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Valentina',
        comment: 'Excelente atención y producto.',
        rating: 5,
        active: false,
      },
    });
  });
});
