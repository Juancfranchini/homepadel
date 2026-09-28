/**
 * La consulta pública de un pedido por número (/orders/track/:number) la usa
 * la pantalla de vuelta de Mercado Pago, sin login. Devolvía nombre, email,
 * teléfono y domicilio a cualquiera con el número, y los números de
 * transferencia (HP-<hora>) y Punto de Venta (POS-<hora>) se pueden adivinar.
 */

import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

const ORDEN = {
  id: 'o-1',
  number: 'POS-1790000000000',
  status: 'PAID',
  paymentStatus: 'PAID',
  total: 750000,
  subtotal: 750000,
  shipping: 0,
  discount: 0,
  createdAt: new Date('2026-09-27T10:00:00Z'),
  address: 'Paunero 1028, CABA',
  notes: JSON.stringify({ buyerEmail: 'cliente@ejemplo.com', buyerPhone: '1140832310', buyerName: 'Cliente Real' }),
  userId: null,
  user: null,
  items: [{ productId: 'p-1', quantity: 1, price: 750000, product: { name: 'Metalbone', slug: 'metalbone', images: [] }, variant: null }],
};

function servicio() {
  const prisma = { order: { findUnique: jest.fn().mockResolvedValue(ORDEN) } };
  return new OrdersService(prisma as never, {} as never, {} as never, {} as never, {} as never, {} as never);
}

describe('OrdersService.trackByNumber', () => {
  it('sin email ni teléfono no devuelve ningún dato del comprador', async () => {
    const pedido = await servicio().trackByNumber('POS-1790000000000');
    const texto = JSON.stringify(pedido);

    expect(texto).not.toContain('cliente@ejemplo.com');
    expect(texto).not.toContain('1140832310');
    expect(texto).not.toContain('Cliente Real');
    expect(texto).not.toContain('Paunero');
  });

  it('sin verificación sigue devolviendo lo que necesita la pantalla de compra', async () => {
    const pedido = await servicio().trackByNumber('POS-1790000000000');
    expect(pedido).toMatchObject({ status: 'PAID', total: 750000, items: [{ productId: 'p-1', quantity: 1 }] });
  });

  it('con el email correcto devuelve el pedido completo, como el rastreo', async () => {
    const pedido = await servicio().trackByNumber('POS-1790000000000', 'Cliente@Ejemplo.com');
    expect(pedido).toMatchObject({ buyerEmail: 'cliente@ejemplo.com', address: 'Paunero 1028, CABA' });
  });

  it('con un email que no coincide no devuelve nada', async () => {
    await expect(servicio().trackByNumber('POS-1790000000000', 'otro@mail.com')).rejects.toBeInstanceOf(NotFoundException);
  });
});
