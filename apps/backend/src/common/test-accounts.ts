import { PrismaService } from '../prisma/prisma.service';

/**
 * Cuentas de prueba: los mails con los que la tienda hace compras para
 * probar el circuito. Lo que se compra o se deja en el carrito con uno de
 * ellos queda marcado como prueba (`isTest`): no suma en las estadísticas ni
 * se informa a Meta, que si no aprende de compras que nunca existieron.
 *
 * La lista se edita desde el backoffice (Configuración → Meta Pixel) y vive
 * en `site_sections`, clave `cuentas_prueba`, que es privada: nunca se sirve
 * a la tienda (ver site-sections.sanitize.ts).
 */
export const CLAVE_CUENTAS_PRUEBA = 'cuentas_prueba';

type PrismaLectura = Pick<PrismaService, 'siteSection'>;

const normalizar = (email: string) => email.trim().toLowerCase();

/** La lista guardada, normalizada. Lo que no sea un mail se ignora. */
export async function mailsDePrueba(prisma: PrismaLectura): Promise<Set<string>> {
  const seccion = await prisma.siteSection.findUnique({ where: { key: CLAVE_CUENTAS_PRUEBA } });
  const emails = (seccion?.data as { emails?: unknown } | null)?.emails;
  if (!Array.isArray(emails)) return new Set();
  return new Set(
    emails.filter((e): e is string => typeof e === 'string').map(normalizar).filter((e) => e.includes('@')),
  );
}

/**
 * True si alguno de los mails es de prueba. Si la lista no se puede leer se
 * responde false: una venta real nunca puede quedar oculta por un error acá.
 */
export async function esCuentaDePrueba(
  prisma: PrismaLectura,
  emails: (string | null | undefined)[],
): Promise<boolean> {
  const candidatos = emails.filter((e): e is string => !!e).map(normalizar);
  if (candidatos.length === 0) return false;
  try {
    const lista = await mailsDePrueba(prisma);
    return candidatos.some((e) => lista.has(e));
  } catch {
    return false;
  }
}
