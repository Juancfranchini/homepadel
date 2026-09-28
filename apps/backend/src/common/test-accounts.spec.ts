import { esCuentaDePrueba, mailsDePrueba } from './test-accounts';

function prismaCon(data: unknown) {
  return { siteSection: { findUnique: jest.fn().mockResolvedValue(data === undefined ? null : { data }) } };
}

describe('cuentas de prueba', () => {
  it('reconoce un mail de la lista sin importar mayúsculas ni espacios', async () => {
    const prisma = prismaCon({ emails: ['Dueno@Tienda.com'] });
    expect(await esCuentaDePrueba(prisma as never, ['  dueno@tienda.COM '])).toBe(true);
  });

  it('un mail que no está en la lista es un cliente real', async () => {
    const prisma = prismaCon({ emails: ['dueno@tienda.com'] });
    expect(await esCuentaDePrueba(prisma as never, ['cliente@gmail.com'])).toBe(false);
  });

  it('alcanza con que uno de los mails sea de prueba (el del checkout o el de la cuenta)', async () => {
    const prisma = prismaCon({ emails: ['dueno@tienda.com'] });
    expect(await esCuentaDePrueba(prisma as never, ['otro@gmail.com', 'dueno@tienda.com'])).toBe(true);
  });

  it('sin mails no consulta la base', async () => {
    const prisma = prismaCon({ emails: ['dueno@tienda.com'] });
    expect(await esCuentaDePrueba(prisma as never, [undefined, null, ''])).toBe(false);
    expect(prisma.siteSection.findUnique).not.toHaveBeenCalled();
  });

  it('sin lista configurada, o con basura guardada, nada es de prueba', async () => {
    expect(await esCuentaDePrueba(prismaCon(undefined) as never, ['dueno@tienda.com'])).toBe(false);
    expect(await mailsDePrueba(prismaCon({ emails: 'no-es-lista' }) as never)).toEqual(new Set());
    expect(await mailsDePrueba(prismaCon({ emails: [3, null, 'sin-arroba', 'ok@x.com'] }) as never)).toEqual(new Set(['ok@x.com']));
  });

  it('si la base falla, la venta se trata como real: nunca se oculta una venta por un error', async () => {
    const prisma = { siteSection: { findUnique: jest.fn().mockRejectedValue(new Error('caída')) } };
    expect(await esCuentaDePrueba(prisma as never, ['dueno@tienda.com'])).toBe(false);
  });
});
