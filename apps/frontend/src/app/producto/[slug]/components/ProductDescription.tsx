interface Props {
  description?: string | null;
}

/**
 * Descripción del producto.
 *
 * La descripción se venía cargando desde el backoffice pero no se renderizaba
 * en ningún lado de la ficha. Si el producto no tiene descripción, la sección
 * entera no se dibuja: es preferible a mostrar un título con el cuerpo vacío.
 */
export default function ProductDescription({ description }: Props) {
  const texto = description?.trim();
  if (!texto) return null;

  // El backoffice guarda texto plano; los saltos de línea marcan los párrafos.
  const parrafos = texto.split(/\n{2,}|\r\n{2,}/).filter((p) => p.trim());

  return (
    <section className="border-t border-[#0D0F0F]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#F7F6F7] mb-4">
          Descripción
        </h2>
        <div className="max-w-3xl flex flex-col gap-3">
          {parrafos.map((parrafo, i) => (
            <p key={i} className="text-sm sm:text-base text-[#C7C7C0] leading-relaxed whitespace-pre-line">
              {parrafo.trim()}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
