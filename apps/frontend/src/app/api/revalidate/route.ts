import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'crypto';

/**
 * Borra el caché de una página para que un cambio del backoffice se vea ya.
 *
 * La home se genera y se cachea (`export const revalidate`), así que apagar
 * una sección en el backoffice no se notaba hasta que el caché venciera:
 * hasta una hora. Refrescar el navegador no servía —el caché es del servidor,
 * no del visitante— y el backoffice decía "los cambios se aplican al
 * instante".
 *
 * Lo llama el backend cada vez que se guarda una sección. Si falta
 * REVALIDATE_SECRET no se revalida nada: la página se actualiza igual cuando
 * vence su propio plazo.
 */
function secretoValido(recibido: string | null, esperado: string): boolean {
  if (!recibido) return false;
  const a = Buffer.from(recibido, 'utf8');
  const b = Buffer.from(esperado, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const esperado = process.env.REVALIDATE_SECRET;

  if (!esperado) {
    return NextResponse.json(
      { revalidated: false, motivo: 'REVALIDATE_SECRET no está configurado' },
      { status: 503 },
    );
  }

  if (!secretoValido(request.headers.get('x-revalidate-secret'), esperado)) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  const cuerpo = await request.json().catch(() => ({}));
  // Solo rutas del propio sitio: se acepta la ruta pero nunca una URL externa.
  const ruta = typeof cuerpo?.path === 'string' && cuerpo.path.startsWith('/') && !cuerpo.path.startsWith('//')
    ? cuerpo.path
    : '/';

  revalidatePath(ruta);
  return NextResponse.json({ revalidated: true, path: ruta });
}
