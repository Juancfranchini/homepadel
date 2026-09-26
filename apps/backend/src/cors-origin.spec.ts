/**
 * El 26/09/2026, al mudar el sitio de homepadel.store a homepadel.com.ar,
 * cambiar `FRONTEND_URL` al dominio nuevo antes de que el DNS terminara de
 * propagar dejó afuera a homepadel.store —que seguía siendo el dominio real
 * que la gente visitaba— y se cayeron envíos, medios de pago, Instagram y la
 * configuración general en el sitio en producción.
 *
 * Estas pruebas fijan que los dos dominios de la tienda entran siempre,
 * pase lo que pase con la variable de entorno.
 */

import { esOrigenPermitido } from './cors-origin';

describe('esOrigenPermitido', () => {
  it('permite los dos dominios de la tienda aunque FRONTEND_URL apunte a otro', () => {
    const env = { frontendUrl: 'https://homepadel.com.ar' };

    expect(esOrigenPermitido('https://homepadel.store', env)).toBe(true);
    expect(esOrigenPermitido('https://www.homepadel.store', env)).toBe(true);
    expect(esOrigenPermitido('https://homepadel.com.ar', env)).toBe(true);
    expect(esOrigenPermitido('https://www.homepadel.com.ar', env)).toBe(true);
  });

  it('los permite incluso sin ninguna variable de entorno configurada', () => {
    expect(esOrigenPermitido('https://homepadel.store', {})).toBe(true);
    expect(esOrigenPermitido('https://homepadel.com.ar', {})).toBe(true);
  });

  it('sigue sumando lo que diga FRONTEND_URL, para una preview o un staging', () => {
    const env = { frontendUrl: 'https://homepadel-git-preview.vercel.app' };
    expect(esOrigenPermitido('https://homepadel-git-preview.vercel.app', env)).toBe(true);
  });

  it('acepta cualquier subdominio de vercel.app', () => {
    expect(esOrigenPermitido('https://homepadel-abc123.vercel.app', {})).toBe(true);
  });

  it('sin origen —curl, Postman, llamadas server-side— deja pasar', () => {
    expect(esOrigenPermitido(undefined, {})).toBe(true);
  });

  it('rechaza un origen que no es ninguno de los conocidos', () => {
    expect(esOrigenPermitido('https://un-sitio-cualquiera.com', {})).toBe(false);
  });

  it('rechaza un dominio parecido pero no exacto', () => {
    expect(esOrigenPermitido('https://homepadel.store.evil.com', {})).toBe(false);
    expect(esOrigenPermitido('http://homepadel.store', {})).toBe(false); // http, no https
  });
});
