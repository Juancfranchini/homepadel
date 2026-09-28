// Envío Flex: reparto en moto en AMBA a cargo de Kiosco Lo de Juan
// (Tribulato 1149). Colecta de 13 a 14 hs y reparto desde las 16 hs.
// Tarifa por zona según la localidad del cliente; las zonas y localidades son
// las del tarifario del kiosco. Los precios se pueden cambiar desde el
// backoffice (site-sections / shipping_rates → flex).

export type ZonaFlex = 1 | 2 | 3;

export interface ConfigFlex {
  activo: boolean;
  precios: Record<ZonaFlex, number>;
}

export const CONFIG_FLEX_POR_DEFECTO: ConfigFlex = {
  activo: true,
  precios: { 1: 4500, 2: 7000, 3: 9000 },
};

/** Partidos y localidades que cubre cada zona, tal como figuran en el tarifario. */
export const LOCALIDADES_FLEX: Record<ZonaFlex, string[]> = {
  1: ['José C. Paz', 'San Miguel', 'Malvinas Argentinas'],
  2: ['Garín', 'Hurlingham', 'Ituzaingó', 'Moreno', 'Morón', 'San Martín', 'Tigre', 'Tres de Febrero'],
  3: [
    'Almirante Brown', 'Avellaneda', 'Berazategui', 'Berisso', 'CABA', 'Campana', 'Cañuelas', 'Del Viso',
    'Presidente Derqui', 'Ensenada', 'Escobar', 'Esteban Echeverría', 'Exaltación de la Cruz', 'Ezeiza',
    'Florencio Varela', 'General Rodríguez', 'Guernica', 'Ingeniero Maschwitz', 'La Matanza', 'La Plata',
    'Lanús', 'Lomas de Zamora', 'Luján', 'Marcos Paz', 'Merlo', 'Nordelta', 'Pilar', 'Presidente Perón',
    'Quilmes', 'San Fernando', 'San Isidro', 'San Vicente', 'Vicente López', 'Villa Rosa', 'Zárate',
  ],
};

/** Otras formas en que la gente escribe la misma localidad. */
const ALIAS: Record<string, string> = {
  'capital federal': 'caba',
  'ciudad autonoma de buenos aires': 'caba',
  'ciudad de buenos aires': 'caba',
  'caba capital federal': 'caba',
  capital: 'caba',
  derqui: 'presidente derqui',
  'derqui presidente': 'presidente derqui',
  'jose clemente paz': 'jose c paz',
  'la matanza norte': 'la matanza',
  'la matanza sur': 'la matanza',
  'gral rodriguez': 'general rodriguez',
  'ing maschwitz': 'ingeniero maschwitz',
  'pte peron': 'presidente peron',
  'pte derqui': 'presidente derqui',
  '3 de febrero': 'tres de febrero',
  'gral san martin': 'san martin',
  'general san martin': 'san martin',
};

/** Minúsculas, sin tildes ni signos, espacios simples: "José C. Paz" → "jose c paz". */
export function normalizarLocalidad(texto: string): string {
  const base = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return ALIAS[base] ?? base;
}

const ZONA_POR_LOCALIDAD = new Map<string, ZonaFlex>(
  (Object.entries(LOCALIDADES_FLEX) as unknown as [string, string[]][]).flatMap(([zona, nombres]) =>
    nombres.map((nombre) => [normalizarLocalidad(nombre), Number(zona) as ZonaFlex] as const),
  ),
);

/** Zona Flex de una localidad, o null si el kiosco no llega. */
export function zonaFlexDe(localidad?: string | null): ZonaFlex | null {
  if (!localidad) return null;
  return ZONA_POR_LOCALIDAD.get(normalizarLocalidad(localidad)) ?? null;
}

/** Prefijo para la dirección del pedido: quien despacha ve el servicio y la zona. */
export function etiquetaFlex(localidad?: string | null): string {
  const zona = zonaFlexDe(localidad);
  return zona ? `Envío Flex (zona ${zona}) — ` : 'Envío Flex — ';
}

/** Combina lo guardado en el backoffice con los valores del tarifario. */
export function configFlex(guardado: unknown): ConfigFlex {
  const g = (guardado ?? {}) as { activo?: unknown; zona1?: unknown; zona2?: unknown; zona3?: unknown };
  const precio = (valor: unknown, porDefecto: number) => {
    const n = Number(valor);
    return Number.isFinite(n) && n >= 0 && valor !== null && valor !== '' && valor !== undefined ? n : porDefecto;
  };
  const d = CONFIG_FLEX_POR_DEFECTO;
  return {
    activo: typeof g.activo === 'boolean' ? g.activo : d.activo,
    precios: { 1: precio(g.zona1, d.precios[1]), 2: precio(g.zona2, d.precios[2]), 3: precio(g.zona3, d.precios[3]) },
  };
}
