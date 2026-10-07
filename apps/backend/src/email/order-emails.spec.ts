import { enlaceWhatsapp, mailDespachado, mailPagoRecibido, mailTransferencia } from './order-emails';

const PEDIDO = { orderNumber: 'HP-1', customerName: 'Ana', items: [{ name: 'Paleta Nox', quantity: 2, price: 100000 }], total: 200000 };
const CUENTA = { alias: 'home.padel', cbu: '0000003100012345678901', titular: 'Home Padel SRL', banco: 'Banco Ejemplo' };

describe('mail de transferencia', () => {
  it('da los datos de la cuenta, el total y pide el comprobante por WhatsApp con el número de la tienda', () => {
    const { html, subject } = mailTransferencia({ ...PEDIDO, datos: CUENTA, whatsapp: '1140832310' });
    expect(subject).toContain('HP-1');
    expect(html).toContain('home.padel');
    expect(html).toContain('0000003100012345678901');
    expect(html).toContain('$');
    expect(html).toMatch(/comprobante/i);
    expect(html).toContain('https://wa.me/5491140832310');
    expect(html).toContain('1140832310');
  });

  it('sin número de WhatsApp cargado igual pide el comprobante, pero sin inventar un link', () => {
    const { html } = mailTransferencia({ ...PEDIDO, datos: CUENTA, whatsapp: null });
    expect(html).toMatch(/comprobante/i);
    expect(html).not.toContain('wa.me');
  });

  it('sin datos de cuenta no deja un recuadro vacío', () => {
    const { html } = mailTransferencia({ ...PEDIDO, datos: null, whatsapp: '1140832310' });
    expect(html).not.toContain('Transferí');
  });

  it('escapa lo que escribió el cliente: no se puede meter HTML en el mail', () => {
    const { html } = mailTransferencia({ ...PEDIDO, customerName: '<script>alert(1)</script>', datos: CUENTA, whatsapp: null });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('mail de pago recibido', () => {
  it('con envío, avisa que va a llegar el seguimiento', () => {
    expect(mailPagoRecibido({ ...PEDIDO, esRetiro: false }).html).toMatch(/seguimiento/i);
  });
  it('con retiro en el local no promete seguimiento', () => {
    const { html } = mailPagoRecibido({ ...PEDIDO, esRetiro: true });
    expect(html).not.toMatch(/seguimiento/i);
    expect(html).toMatch(/retirar/i);
  });
});

describe('mail de pedido despachado', () => {
  it('lleva el número y el link de seguimiento', () => {
    const { html } = mailDespachado({ orderNumber: 'HP-1', customerName: 'Ana', trackingNumber: 'AR123', trackingUrl: 'https://correo.example/seguir?n=AR123' });
    expect(html).toContain('AR123');
    expect(html).toContain('href="https://correo.example/seguir?n=AR123"');
  });
  it('sin seguimiento avisa igual, sin un "Pendiente" inventado', () => {
    const { html } = mailDespachado({ orderNumber: 'HP-1', customerName: 'Ana' });
    expect(html).toMatch(/en camino/i);
    expect(html).not.toMatch(/pendiente|seguimiento:/i);
  });
  it('un link que no es http(s) se descarta (javascript: en un href)', () => {
    expect(mailDespachado({ orderNumber: 'HP-1', customerName: 'Ana', trackingUrl: 'javascript:alert(1)' }).html).not.toContain('javascript');
  });
});

describe('enlaceWhatsapp', () => {
  it('arma el link con el código de país', () => {
    expect(enlaceWhatsapp('11 4083-2310')).toBe('https://wa.me/5491140832310');
    expect(enlaceWhatsapp('+54 9 11 4083 2310')).toBe('https://wa.me/5491140832310');
    expect(enlaceWhatsapp('123')).toBeNull();
    expect(enlaceWhatsapp(null)).toBeNull();
  });
});
