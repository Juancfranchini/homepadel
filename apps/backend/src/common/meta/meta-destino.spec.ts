import { esOrigenDeProduccion } from './meta-destino';
import { clienteDesdeRequest } from './meta-cliente';

describe('esOrigenDeProduccion', () => {
  const entorno = process.env;
  afterEach(() => {
    process.env = entorno;
  });

  it('solo la tienda de producción, por https', () => {
    expect(esOrigenDeProduccion('https://www.homepadel.com.ar')).toBe(true);
    expect(esOrigenDeProduccion('https://www.homepadel.com.ar/checkout?x=1')).toBe(true);
    expect(esOrigenDeProduccion('http://www.homepadel.com.ar')).toBe(false);
    expect(esOrigenDeProduccion('http://localhost:3000')).toBe(false);
    expect(esOrigenDeProduccion('https://homepadel.store')).toBe(false);
    expect(esOrigenDeProduccion('https://www.homepadel.com.ar.evil.com')).toBe(false);
    expect(esOrigenDeProduccion(undefined)).toBe(false);
    expect(esOrigenDeProduccion('cualquier cosa')).toBe(false);
  });

  it('los dominios de producción se pueden cambiar por entorno', () => {
    process.env = { ...entorno, META_PRODUCTION_HOSTS: 'homepadel.com.ar, www.homepadel.com.ar' };
    expect(esOrigenDeProduccion('https://homepadel.com.ar')).toBe(true);
  });
});

describe('clienteDesdeRequest', () => {
  const req = (headers: Record<string, string>) => ({ headers, socket: {} }) as never;

  it('sin header Origin toma el origen del Referer', () => {
    expect(clienteDesdeRequest(req({ referer: 'https://www.homepadel.com.ar/checkout' })).origen).toBe('https://www.homepadel.com.ar');
  });

  it('prefiere las cookies que manda el navegador y descarta las que no tienen formato de Pixel', () => {
    const cliente = clienteDesdeRequest(req({ cookie: '_fbp=basura; _fbc=fb.1.1700000000000.Cookie' }), { fbp: 'fb.1.1700000000000.123' });
    expect(cliente.fbp).toBe('fb.1.1700000000000.123');
    expect(cliente.fbc).toBe('fb.1.1700000000000.Cookie');
  });
});
