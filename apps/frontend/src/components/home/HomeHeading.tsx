/**
 * El único h1 de la portada, fijo y con las palabras del negocio.
 *
 * Antes el h1 era el título del slide del hero, que se edita en el backoffice
 * y cambia con cada promo ("PALETAS NOX EN 12 CUOTAS SIN INTERÉS"): Google
 * tomaba eso como el tema de la página. Va en una franja fina para no correr
 * el hero, y se muestra aunque el hero esté apagado.
 */
export default function HomeHeading() {
  return (
    <h1 className="bg-[#050606] border-b border-white/5 px-4 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#C7C7C0]">
      Paletas, indumentaria y accesorios de <span className="text-[#B7D31A]">pádel</span>
    </h1>
  );
}
