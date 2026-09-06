/**
 * Firma del aviso de pago de Mercado Pago.
 *
 * Por qué existe esta prueba: la implementación anterior firmaba
 * `xRequestId + JSON.stringify(body)` y comparaba contra la cabecera completa.
 * Ninguna firma legítima podía coincidir, así que con el secreto configurado se
 * rechazaban todos los pagos y sin configurar no se validaba nada. El error pasó
 * inadvertido porque no había forma de notarlo sin un pago real.
 *
 * Acá se arma la firma igual que la arma Mercado Pago —manifest
 * `id:<data.id>;request-id:<id>;ts:<ts>;` firmado con HMAC-SHA256— y se
 * comprueba que el servicio la acepta, y que rechaza todo lo demás.
 */

import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';

const SECRETO = 'secreto-de-webhook-de-prueba';
const PAYMENT_ID = '123456789';
const REQUEST_ID = 'abc-request-1';
const TS = '1704908010';

/** Reproduce exactamente lo que firma Mercado Pago. */
function firmaLegitima(paymentId = PAYMENT_ID, requestId = REQUEST_ID, ts = TS, secreto = SECRETO) {
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac('sha256', secreto).update(manifest).digest('hex');
  return `ts=${ts},v1=${v1}`;
}

/** El servicio solo necesita sus dependencias para otras operaciones. */
function service() {
  return new PaymentsService(null as any, null as any);
}

/** `isSignatureValid` es privado; en TypeScript eso es solo de compilación. */
function validar(svc: PaymentsService, id: string, firma: string, requestId: string): boolean {
  return (svc as any).isSignatureValid(id, firma, requestId);
}

describe('Firma del webhook — con secreto configurado', () => {
  const original = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  beforeEach(() => { process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRETO; });
  afterAll(() => {
    if (original === undefined) delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    else process.env.MERCADOPAGO_WEBHOOK_SECRET = original;
  });

  it('acepta una firma legítima', () => {
    expect(validar(service(), PAYMENT_ID, firmaLegitima(), REQUEST_ID)).toBe(true);
  });

  it('rechaza una firma alterada', () => {
    const falsa = `ts=${TS},v1=${'0'.repeat(64)}`;
    expect(validar(service(), PAYMENT_ID, falsa, REQUEST_ID)).toBe(false);
  });

  it('rechaza reutilizar la firma para otro pago', () => {
    // Sin esto, alguien podría capturar un aviso válido y reenviarlo
    // cambiando el identificador para acreditar otra compra.
    expect(validar(service(), '999999', firmaLegitima(), REQUEST_ID)).toBe(false);
  });

  it('rechaza si cambia el request-id', () => {
    expect(validar(service(), PAYMENT_ID, firmaLegitima(), 'otro-request')).toBe(false);
  });

  it('rechaza si cambia la marca de tiempo', () => {
    const conOtroTs = firmaLegitima(PAYMENT_ID, REQUEST_ID, TS).replace(`ts=${TS}`, 'ts=1704908999');
    expect(validar(service(), PAYMENT_ID, conOtroTs, REQUEST_ID)).toBe(false);
  });

  it('rechaza una firma hecha con otro secreto', () => {
    const otra = firmaLegitima(PAYMENT_ID, REQUEST_ID, TS, 'secreto-equivocado');
    expect(validar(service(), PAYMENT_ID, otra, REQUEST_ID)).toBe(false);
  });

  const malformadas: Array<[string, string]> = [
    ['cabecera vacía', ''],
    ['sin estructura', 'basura'],
    ['sin v1', `ts=${TS}`],
    ['sin ts', 'v1=abc'],
    ['v1 más corto', `ts=${TS},v1=abc`],
  ];

  it.each(malformadas)('rechaza cabecera %s', (_titulo, firma) => {
    expect(validar(service(), PAYMENT_ID, firma, REQUEST_ID)).toBe(false);
  });

  it('tolera espacios alrededor de los separadores', () => {
    const firma = firmaLegitima();
    const conEspacios = firma.split(',').map((p) => ' ' + p + ' ').join(',');
    expect(validar(service(), PAYMENT_ID, conEspacios, REQUEST_ID)).toBe(true);
  });
});

describe('Firma del webhook — sin secreto configurado', () => {
  const secretoOriginal = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const entornoOriginal = process.env.NODE_ENV;

  beforeEach(() => { delete process.env.MERCADOPAGO_WEBHOOK_SECRET; });
  afterAll(() => {
    if (secretoOriginal === undefined) delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    else process.env.MERCADOPAGO_WEBHOOK_SECRET = secretoOriginal;
    process.env.NODE_ENV = entornoOriginal;
  });

  it('en desarrollo deja pasar, para poder trabajar sin configurar nada', () => {
    // El módulo lee NODE_ENV al cargarse, así que se re-importa en aislamiento.
    jest.isolateModules(() => {
      process.env.NODE_ENV = 'development';
      const { PaymentsService: Dev } = require('./payments.service');
      const svc = new Dev(null, null);
      expect((svc as any).isSignatureValid(PAYMENT_ID, '', REQUEST_ID)).toBe(true);
    });
  });

  it('en producción rechaza el aviso en lugar de creerle', () => {
    // Aceptar avisos sin verificar permitiría a cualquiera marcar órdenes
    // como pagadas con una sola petición.
    jest.isolateModules(() => {
      process.env.NODE_ENV = 'production';
      const { PaymentsService: Prod } = require('./payments.service');
      const svc = new Prod(null, null);
      expect((svc as any).isSignatureValid(PAYMENT_ID, firmaLegitima(), REQUEST_ID)).toBe(false);
    });
  });
});
