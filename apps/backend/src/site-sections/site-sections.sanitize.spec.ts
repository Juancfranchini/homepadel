/**
 * Saneamiento de la configuración pública.
 *
 * Contexto: la tabla de secciones guarda tanto textos del sitio como
 * credenciales de integraciones, y se lee desde un endpoint público. Ya pasó una
 * vez que una integración nueva —Cloudinary— publicara su apiSecret en internet
 * porque el filtro de entonces miraba una sola clave y un solo campo.
 *
 * Estas pruebas fijan el criterio: se niega por nombre de campo, a cualquier
 * profundidad y sin importar la clave. El caso que más importa es el último de
 * cada bloque: que una integración inventada mañana quede cubierta sola.
 */

import { sanitizeSection } from './site-sections.sanitize';

const cloudinary = {
  key: 'cloudinary',
  active: true,
  data: { apiKey: '162697376221662', apiSecret: '7yO6I4qVaZ', cloudName: 'w6tdpzor' },
};

const mediosDePago = {
  key: 'payment_methods',
  active: true,
  data: {
    mercadopago: { active: true, publicKey: 'APP_USR-pub-123', accessToken: 'APP_USR-SECRETO' },
    transferencia: { cbu: '0000003100054279', alias: 'homepadel', titular: 'Home Pádel' },
    correo_argentino: { usuario: 'admin', password: 'hunter2', apiKey: 'ca-key-1' },
  },
};

const metaPixel = {
  key: 'meta_pixel',
  active: true,
  data: { pixelId: '123456', accessToken: 'EAAG-secreto', events: { pageView: true } },
};

describe('sanitizeSection — consulta anónima', () => {
  it('vacía por completo las claves privadas', () => {
    expect(sanitizeSection(cloudinary, false).data).toEqual({});
  });

  it('elimina credenciales anidadas pero conserva el resto', () => {
    const data: any = sanitizeSection(mediosDePago, false).data;

    expect(data.mercadopago.accessToken).toBeUndefined();
    expect(data.correo_argentino.password).toBeUndefined();
    expect(data.correo_argentino.usuario).toBeUndefined();
    expect(data.correo_argentino.apiKey).toBeUndefined();

    // Lo que el navegador sí necesita sigue estando
    expect(data.mercadopago.active).toBe(true);
    expect(data.transferencia).toEqual({
      cbu: '0000003100054279',
      alias: 'homepadel',
      titular: 'Home Pádel',
    });
  });

  it('conserva publicKey de Mercado Pago', () => {
    // No es un descuido: el checkout no puede iniciarse sin ella.
    // Por eso el filtro no puede ser un patrón amplio sobre la palabra "key".
    const data: any = sanitizeSection(mediosDePago, false).data;
    expect(data.mercadopago.publicKey).toBe('APP_USR-pub-123');
  });

  it('cubre una integración que no estaba prevista', () => {
    const inventada = {
      key: 'pasarela_nueva',
      active: true,
      data: {
        nombre: 'Pasarela X',
        logo: 'https://cdn/logo.png',
        credenciales: { clientSecret: 'secreto', webhookSecret: 'otro', merchantId: 'M-1' },
      },
    };

    const data: any = sanitizeSection(inventada, false).data;

    expect(data.credenciales.clientSecret).toBeUndefined();
    expect(data.credenciales.webhookSecret).toBeUndefined();
    // El identificador de comercio no es secreto y se conserva
    expect(data.credenciales.merchantId).toBe('M-1');
    expect(data.nombre).toBe('Pasarela X');
  });

  it('sanea dentro de listas', () => {
    const conLista = {
      key: 'integraciones',
      active: true,
      data: { items: [{ nombre: 'A', token: 'secreto-a' }, { nombre: 'B', token: 'secreto-b' }] },
    };

    const data: any = sanitizeSection(conLista, false).data;
    expect(data.items).toEqual([{ nombre: 'A' }, { nombre: 'B' }]);
  });

  it('no rompe con datos vacíos o nulos', () => {
    expect(() => sanitizeSection({ key: 'x', data: null } as any, false)).not.toThrow();
    expect(() => sanitizeSection({ key: 'x', data: undefined } as any, false)).not.toThrow();
    expect(() => sanitizeSection({ key: 'x', data: {} } as any, false)).not.toThrow();
  });

  it('elimina el token de Meta pero deja el identificador del píxel', () => {
    const data: any = sanitizeSection(metaPixel, false).data;
    expect(data.accessToken).toBeUndefined();
    expect(data.pixelId).toBe('123456');
    expect(data.events).toEqual({ pageView: true });
  });
});

describe('sanitizeSection — administrador autenticado', () => {
  it('devuelve la sección intacta', () => {
    // El backoffice necesita leer las credenciales para poder editarlas.
    expect(sanitizeSection(cloudinary, true)).toEqual(cloudinary);
    expect(sanitizeSection(mediosDePago, true)).toEqual(mediosDePago);
  });

  it('no modifica el objeto original al sanear', () => {
    const copia = JSON.parse(JSON.stringify(mediosDePago));
    sanitizeSection(mediosDePago, false);
    expect(mediosDePago).toEqual(copia);
  });
});
