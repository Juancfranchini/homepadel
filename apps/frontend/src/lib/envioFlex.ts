// Envío Flex (moto en AMBA, Kiosco Lo de Juan). Las zonas, localidades y
// precios los define el backend (GET /envio-flex, fuente: apps/backend/src/
// shipping/envio-flex.ts) y el costo real lo recalcula el servidor al crear el
// pedido. Acá solo se ubica la localidad que escribe el cliente para mostrarle
// el precio y sugerirle Flex.

export interface ZonaFlexInfo {
  zona: 1 | 2 | 3;
  precio: number;
  localidades: string[];
}

export interface EnvioFlexInfo {
  activo: boolean;
  zonas: ZonaFlexInfo[];
}

// Las mismas equivalencias que acepta el backend para escribir una localidad.
const ALIAS: Record<string, string> = {
  'capital federal': 'caba',
  'ciudad autonoma de buenos aires': 'caba',
  'ciudad de buenos aires': 'caba',
  capital: 'caba',
  derqui: 'presidente derqui',
  'jose clemente paz': 'jose c paz',
  'la matanza norte': 'la matanza',
  'la matanza sur': 'la matanza',
  '3 de febrero': 'tres de febrero',
  'general san martin': 'san martin',
};

export function normalizarLocalidad(texto: string): string {
  const base = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return ALIAS[base] ?? base;
}

/** Zona, precio y nombre oficial de la localidad, o null si Flex no llega. */
export function buscarZonaFlex(info: EnvioFlexInfo, localidad?: string | null) {
  if (!info.activo || !localidad) return null;
  const buscada = normalizarLocalidad(localidad);
  for (const zona of info.zonas) {
    const encontrada = zona.localidades.find((nombre) => normalizarLocalidad(nombre) === buscada);
    if (encontrada) return { zona: zona.zona, precio: zona.precio, localidad: encontrada };
  }
  return null;
}

/** Provincia que corresponde a una localidad con Flex. */
export const provinciaDeLocalidadFlex = (localidad: string) => (localidad === 'CABA' ? 'CABA' : 'Buenos Aires');
