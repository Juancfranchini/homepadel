import { EmailService } from './email.service';

describe('EmailService transfer notification', () => {
  it('avisa al email del dueño con los datos del pedido escapados', async () => {
    const prisma = { siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { adminEmail: 'dueno@example.com' } }) } };
    const service = new EmailService(prisma as never);
    const send = jest.spyOn(service, 'sendEmail').mockResolvedValue({} as never);

    await service.sendTransferOrderNotification({
      orderNumber: 'HP-123',
      customerName: '<Cliente>',
      customerEmail: 'cliente@example.com',
      customerPhone: '1123456789',
      address: 'Calle 123',
      items: [{ name: 'Pala & Funda', quantity: 1, price: 100000 }],
      total: 104500,
    });

    expect(send).toHaveBeenCalledWith(
      'dueno@example.com',
      expect.stringContaining('HP-123'),
      expect.stringContaining('&lt;Cliente&gt;'),
    );
    expect(send.mock.calls[0][2]).toContain('Pala &amp; Funda');
  });
});
