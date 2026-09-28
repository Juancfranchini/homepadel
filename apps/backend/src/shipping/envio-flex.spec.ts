/**
 * La zona del Envío Flex sale de la localidad que elige el cliente. La gente
 * escribe la misma localidad de muchas formas (con o sin tildes, "Capital
 * Federal" en vez de CABA), así que la comparación tiene que tolerarlo.
 */
import { configFlex, etiquetaFlex, LOCALIDADES_FLEX, normalizarLocalidad, zonaFlexDe } from './envio-flex';

describe('Envío Flex — zona según la localidad', () => {
  it('ubica cada localidad del tarifario en su zona', () => {
    for (const zona of [1, 2, 3] as const) {
      for (const localidad of LOCALIDADES_FLEX[zona]) expect(zonaFlexDe(localidad)).toBe(zona);
    }
  });

  it('ninguna localidad aparece en dos zonas', () => {
    const todas = Object.values(LOCALIDADES_FLEX).flat().map(normalizarLocalidad);
    expect(new Set(todas).size).toBe(todas.length);
  });

  it('tolera tildes, mayúsculas, puntos y espacios', () => {
    expect(zonaFlexDe('JOSE C PAZ')).toBe(1);
    expect(zonaFlexDe('  josé c.  paz ')).toBe(1);
    expect(zonaFlexDe('moron')).toBe(2);
    expect(zonaFlexDe('Cañuelas')).toBe(3);
  });

  it('reconoce las formas habituales de escribir la misma localidad', () => {
    expect(zonaFlexDe('Capital Federal')).toBe(3);
    expect(zonaFlexDe('Ciudad Autónoma de Buenos Aires')).toBe(3);
    expect(zonaFlexDe('Derqui')).toBe(3);
    expect(zonaFlexDe('La Matanza Sur')).toBe(3);
    expect(zonaFlexDe('3 de Febrero')).toBe(2);
    expect(zonaFlexDe('General San Martín')).toBe(2);
  });

  it('devuelve null fuera de zona o sin localidad', () => {
    expect(zonaFlexDe('Rosario')).toBeNull();
    expect(zonaFlexDe('')).toBeNull();
    expect(zonaFlexDe(undefined)).toBeNull();
  });

  it('la etiqueta del pedido dice el servicio y la zona', () => {
    expect(etiquetaFlex('Moreno')).toBe('Envío Flex (zona 2) — ');
  });
});

describe('Envío Flex — configuración', () => {
  it('sin nada guardado usa el tarifario del kiosco', () => {
    expect(configFlex(undefined)).toEqual({ activo: true, precios: { 1: 4500, 2: 7000, 3: 9000 } });
  });

  it('un precio inválido o vacío cae al del tarifario', () => {
    expect(configFlex({ zona1: '', zona2: -5, zona3: 'abc' }).precios).toEqual({ 1: 4500, 2: 7000, 3: 9000 });
  });

  it('respeta lo guardado en el backoffice', () => {
    expect(configFlex({ activo: false, zona1: 5000, zona2: '8000', zona3: 0 })).toEqual({
      activo: false,
      precios: { 1: 5000, 2: 8000, 3: 0 },
    });
  });
});
