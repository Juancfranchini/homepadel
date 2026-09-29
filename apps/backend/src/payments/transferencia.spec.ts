/**
 * Transferencia: doble llave (variable de entorno + backoffice), los datos de
 * la cuenta nunca van en la configuración pública, y un cliente no puede
 * acumular pedidos sin pagar que bloqueen stock.
 */
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exigirTransferencia, mediosDePagoPublicos, transferenciaHabilitada } from './transferencia';

const CONFIG = { transferencia: { active: true, alias: 'home.padel', cbu: '0000003100000000000001', titular: 'Home Padel', banco: 'MP', logo: '/t.png' } };

function fakePrisma(data: unknown, pendientes = 0) {
  return {
    siteSection: { findUnique: jest.fn(async () => (data ? { key: 'payment_methods', data } : null)) },
    order: { count: jest.fn(async () => pendientes) },
  } as unknown as PrismaService;
}

describe('Transferencia bancaria', () => {
  const original = process.env.ENABLE_BANK_TRANSFER;
  afterEach(() => { process.env.ENABLE_BANK_TRANSFER = original; });

  it('necesita las dos llaves: variable de entorno y backoffice', () => {
    process.env.ENABLE_BANK_TRANSFER = 'false';
    expect(transferenciaHabilitada(CONFIG)).toBe(false);
    process.env.ENABLE_BANK_TRANSFER = 'true';
    expect(transferenciaHabilitada(CONFIG)).toBe(true);
    expect(transferenciaHabilitada({ transferencia: { ...CONFIG.transferencia, active: false } })).toBe(false);
  });

  it('la configuración pública no lleva CBU, alias, titular ni banco', () => {
    process.env.ENABLE_BANK_TRANSFER = 'true';
    const publica = mediosDePagoPublicos({ key: 'payment_methods', data: { ...CONFIG, mercadopago: { active: true } } });
    expect(publica.data).toEqual({ mercadopago: { active: true }, transferencia: { active: true, logo: '/t.png' } });
  });

  it('en la configuración pública, "activa" refleja las dos llaves', () => {
    process.env.ENABLE_BANK_TRANSFER = 'false';
    const publica = mediosDePagoPublicos({ key: 'payment_methods', data: CONFIG });
    expect((publica.data as typeof CONFIG).transferencia.active).toBe(false);
  });

  it('al tomar el pedido devuelve los datos para transferir', async () => {
    process.env.ENABLE_BANK_TRANSFER = 'true';
    await expect(exigirTransferencia(fakePrisma(CONFIG), 'u1')).resolves.toEqual({
      alias: 'home.padel', cbu: '0000003100000000000001', titular: 'Home Padel', banco: 'MP',
    });
  });

  it('rechaza el pedido si está apagada', async () => {
    process.env.ENABLE_BANK_TRANSFER = 'false';
    await expect(exigirTransferencia(fakePrisma(CONFIG), 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza un tercer pedido sin pagar del mismo cliente', async () => {
    process.env.ENABLE_BANK_TRANSFER = 'true';
    await expect(exigirTransferencia(fakePrisma(CONFIG, 2), 'u1')).rejects.toBeInstanceOf(BadRequestException);
    await expect(exigirTransferencia(fakePrisma(CONFIG, 1), 'u1')).resolves.toBeTruthy();
  });

  it('comprando como invitado, el tope va por el mail del pedido', async () => {
    process.env.ENABLE_BANK_TRANSFER = 'true';
    const prisma = fakePrisma(CONFIG, 2);
    await expect(exigirTransferencia(prisma, undefined, 'Invitado@Mail.com')).rejects.toBeInstanceOf(BadRequestException);
    expect((prisma.order.count as jest.Mock).mock.calls[0][0].where.OR).toEqual([
      { notes: { contains: '"buyerEmail":"Invitado@Mail.com"', mode: 'insensitive' } },
    ]);
  });
});
