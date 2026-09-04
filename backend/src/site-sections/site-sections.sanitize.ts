// N1 — Saneamiento de secciones del sitio para consultas públicas
//
// El endpoint GET /site-sections/:key es público: lo consume la tienda para
// renderizar textos, logos y medios de pago disponibles. Pero la misma tabla
// guarda credenciales de integraciones (Mercado Pago, Cloudinary, correos).
//
// El criterio acá es negar por defecto a nivel de campo, sin depender de qué
// clave se está pidiendo. Un filtro atado a una clave puntual deja de proteger
// en cuanto aparece una integración nueva — que es exactamente lo que pasó
// cuando se agregó Cloudinary.

/** Claves cuyo contenido es íntegramente privado: nunca se sirven sin sesión de admin. */
const PRIVATE_KEYS = new Set([
  'cloudinary',
  'email_settings',
  'email_config',
  'resend',
  'meta_capi',
  'meta_conversions',
]);

/**
 * Campos sensibles, detectados por nombre en cualquier nivel del objeto.
 *
 * Se listan de forma explícita en lugar de usar un patrón amplio como /key/i,
 * porque hay campos que contienen "key" y SÍ deben ser públicos —el caso de
 * `publicKey` de Mercado Pago, que el navegador necesita para inicializar el
 * checkout—. Errar hacia lo restrictivo acá rompería la tienda.
 */
const SENSITIVE_SUBSTRING = /(secret|token|password|passwd|credential|signature)/i;
const SENSITIVE_EXACT = new Set([
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'usuario',
  'username',
  'user',
  'pass',
]);

function isSensitiveField(name: string): boolean {
  if (SENSITIVE_SUBSTRING.test(name)) return true;
  return SENSITIVE_EXACT.has(name.toLowerCase());
}

/** Recorre el objeto y elimina todo campo sensible, a cualquier profundidad. */
function scrub(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrub);

  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [field, inner] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveField(field)) continue;
      out[field] = scrub(inner);
    }
    return out;
  }

  return value;
}

interface Section {
  key: string;
  data?: unknown;
  active?: boolean;
  [extra: string]: unknown;
}

/**
 * Devuelve la versión de la sección apta para una consulta anónima.
 * Si `isAdmin` es true la sección se devuelve intacta, para que el backoffice
 * pueda leer y editar las credenciales que administra.
 */
export function sanitizeSection<T extends Section>(section: T, isAdmin: boolean): T {
  if (isAdmin) return section;

  if (PRIVATE_KEYS.has(section.key)) {
    // Se responde la sección vacía en lugar de un error: quien la consulta sin
    // permisos no necesita su contenido, y así no se rompe ninguna pantalla.
    return { ...section, data: {} };
  }

  return { ...section, data: scrub(section.data) };
}
