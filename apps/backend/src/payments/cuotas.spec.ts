import { configCuotas, cuotasPara, CUOTAS_POR_DEFECTO } from './cuotas';

describe('cuotas por monto', () => {
  const config = configCuotas({ activo: true, tramos: [{ desde: 400000, cuotas: 12 }, { desde: 300000, cuotas: 9 }], cuotasBase: 1 });

  it('toma el tramo más alto alcanzado', () => {
    expect(cuotasPara(250000, config)).toBe(1);
    expect(cuotasPara(300000, config)).toBe(9);
    expect(cuotasPara(399999, config)).toBe(9);
    expect(cuotasPara(400000, config)).toBe(12);
  });

  it('sin nada guardado queda inactivo, con la propuesta del negocio precargada', () => {
    expect(configCuotas(undefined)).toEqual(CUOTAS_POR_DEFECTO);
    expect(CUOTAS_POR_DEFECTO.activo).toBe(false);
  });

  it('descarta tramos mal cargados', () => {
    const c = configCuotas({ activo: true, tramos: [{ desde: 'x', cuotas: 3 }, { desde: 100, cuotas: 0 }, { desde: 200, cuotas: 6 }] });
    expect(c.tramos).toEqual([{ desde: 200, cuotas: 6 }]);
    expect(c.cuotasBase).toBe(1);
  });
});
