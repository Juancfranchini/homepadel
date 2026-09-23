/**
 * Dirección pública del sitio.
 *
 * Se lee del entorno porque el dominio comercial cambia: la tienda vivió en
 * homepadel.store mientras homepadel.com.ar servía otra plataforma, y al
 * mudarla alcanza con cambiar `NEXT_PUBLIC_SITE_URL` en Vercel. Escrita a mano
 * haría que las previsualizaciones al compartir, las URLs canónicas y el
 * sitemap apunten al lugar equivocado justo el día de la mudanza.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  // Vercel expone el dominio del despliegue; sirve como valor razonable
  // en previsualizaciones sin tener que configurar nada.
  if (process.env.VERCEL_URL) return 'https://' + process.env.VERCEL_URL;
  return 'http://localhost:3000';
}
