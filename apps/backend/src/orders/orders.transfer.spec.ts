import { OrdersService } from './orders.service';

describe('OrdersService transfer policy', () => {
  const originalFlag = process.env.ENABLE_BANK_TRANSFER;
  const siteSection = { findUnique: jest.fn() };
  const pricing = { resolveItems: jest.fn() };
  const service = new OrdersService(
    { siteSection } as never,
    {} as never,
    pricing as never,
    {} as never,
    {} as never,
  );
  const dto = {
    paymentMethod: 'transfer' as const,
    address: 'Calle 123, Buenos Aires',
    items: [{ productId: 'product-1', quantity: 1 }],
    buyerEmail: 'cliente@example.com',
    buyerPhone: '1123456789',
    buyerName: 'Cliente Prueba',
  };

  beforeEach(() => {
    delete process.env.ENABLE_BANK_TRANSFER;
    siteSection.findUnique.mockReset();
    pricing.resolveItems.mockReset();
  });

  afterAll(() => {
    if (originalFlag === undefined) delete process.env.ENABLE_BANK_TRANSFER;
    else process.env.ENABLE_BANK_TRANSFER = originalFlag;
  });

  it('rechaza la transferencia por defecto antes de reservar stock', async () => {
    siteSection.findUnique.mockResolvedValue({ data: { transferencia: { active: true } } });

    await expect(service.create(dto, 'user-1')).rejects.toThrow('no está habilitada');
    expect(pricing.resolveItems).not.toHaveBeenCalled();
  });

  it('tambien exige que la configuracion guardada este activa', async () => {
    process.env.ENABLE_BANK_TRANSFER = 'true';
    siteSection.findUnique.mockResolvedValue({ data: { transferencia: { active: false } } });

    await expect(service.create(dto, 'user-1')).rejects.toThrow('no está habilitada');
    expect(pricing.resolveItems).not.toHaveBeenCalled();
  });
});
