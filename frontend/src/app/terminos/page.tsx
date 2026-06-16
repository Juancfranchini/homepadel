import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones | Home Pádel',
  description: 'Leé los términos y condiciones de uso de la tienda online de Home Pádel.',
};

const SECTIONS = [
  {
    title: '1. Aceptación de los términos',
    content: `Al acceder y utilizar el sitio web de Home Pádel (homepadel.com.ar), el usuario acepta estar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestro sitio.`,
  },
  {
    title: '2. Quiénes somos',
    content: `Home Pádel es una tienda especializada en equipamiento de pádel con sede en Buenos Aires, Argentina. Comercializamos paletas, zapatillas, indumentaria y accesorios de las principales marcas del mercado.`,
  },
  {
    title: '3. Registro y cuenta de usuario',
    content: `Para comprar en nuestro sitio podés hacerlo como invitado o creando una cuenta. Al registrarte, te comprometés a:

• Proporcionar información verdadera, precisa y completa.
• Mantener actualizada dicha información.
• Mantener la confidencialidad de tu contraseña.
• Notificarnos inmediatamente ante cualquier uso no autorizado de tu cuenta.

Home Pádel se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos.`,
  },
  {
    title: '4. Productos y precios',
    content: `• Todos los precios publicados incluyen IVA y están expresados en pesos argentinos (ARS).
• Nos reservamos el derecho de modificar precios sin previo aviso.
• En caso de error en el precio publicado, nos contactaremos con vos antes de procesar el pedido.
• Las imágenes de los productos son de carácter ilustrativo; los colores pueden variar según la pantalla.
• La disponibilidad de stock se actualiza en tiempo real pero puede existir algún margen de error. En ese caso, te avisaremos de inmediato.`,
  },
  {
    title: '5. Proceso de compra',
    content: `Al realizar un pedido:

1. Seleccionás los productos y los añadís al carrito.
2. Completás los datos de envío y método de pago.
3. Confirmás el pedido y realizás el pago.
4. Recibirás un email de confirmación con el detalle y número de pedido.

El contrato de compraventa se perfecciona una vez acreditado el pago.`,
  },
  {
    title: '6. Pagos',
    content: `Aceptamos los métodos de pago detallados en nuestra sección de Medios de Pago. Todos los pagos son procesados de forma segura a través de plataformas certificadas. No almacenamos datos de tarjetas de crédito o débito.`,
  },
  {
    title: '7. Envíos',
    content: `Los envíos se realizan a todo el país a través de operadores logísticos. Los tiempos y costos se detallan en nuestra sección de Envíos. Home Pádel no se responsabiliza por demoras causadas por el operador logístico o por causas de fuerza mayor.`,
  },
  {
    title: '8. Devoluciones y cambios',
    content: `Podés solicitar un cambio o devolución dentro de los 30 días corridos desde la recepción del pedido, siempre que el producto esté sin uso y en su embalaje original. Consultá los detalles completos en nuestra Política de Devolución.`,
  },
  {
    title: '9. Propiedad intelectual',
    content: `Todos los contenidos del sitio (textos, imágenes, logos, diseño) son propiedad de Home Pádel o de sus respectivos titulares y están protegidos por las leyes de propiedad intelectual vigentes. Queda prohibida su reproducción total o parcial sin autorización expresa.`,
  },
  {
    title: '10. Limitación de responsabilidad',
    content: `Home Pádel no será responsable por:

• Daños indirectos, incidentales o consecuentes derivados del uso del sitio.
• Interrupciones del servicio por causas técnicas o de fuerza mayor.
• Contenido de sitios de terceros enlazados desde nuestro sitio.`,
  },
  {
    title: '11. Ley aplicable y jurisdicción',
    content: `Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.`,
  },
  {
    title: '12. Modificaciones',
    content: `Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor desde su publicación en el sitio. El uso continuado del sitio implica la aceptación de los términos modificados.`,
  },
  {
    title: '13. Contacto',
    content: `Para consultas sobre estos términos, podés contactarnos en:

Email: legal@homepadel.com.ar
Dirección: Buenos Aires, Argentina`,
  },
];

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#050606] text-white">

      {/* BREADCRUMB */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Términos y Condiciones</span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-14">
        <p className="text-[#B7D31A] text-xs font-black uppercase tracking-[0.2em] mb-3">LEGAL</p>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          Términos y Condiciones
        </h1>
        <p className="text-[#A1A1AA] text-sm">Última actualización: enero 2026</p>
        <p className="text-[#A1A1AA] text-base leading-relaxed mt-4">
          Por favor, leé atentamente estos términos antes de utilizar nuestro sitio web o realizar una compra.
        </p>
      </section>

      {/* CONTENIDO */}
      <section className="border-t border-white/[0.06] py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-6">
            {SECTIONS.map((section, i) => (
              <div key={i} className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 md:p-8">
                <h2 className="text-white font-black text-base mb-3">{section.title}</h2>
                <div className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-center justify-center">
            <Link
              href="/privacidad"
              className="px-6 lg:px-8 py-2 border border-white/20 text-[#A1A1AA] text-sm rounded-xl hover:border-white/40 hover:text-white transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/politica-de-devolucion"
              className="px-6 lg:px-8 py-2 border border-white/20 text-[#A1A1AA] text-sm rounded-xl hover:border-white/40 hover:text-white transition-colors"
            >
              Política de Devolución
            </Link>
            <Link
              href="/contacto"
              className="px-6 lg:px-8 py-2 bg-[#B7D31A] text-[#050606] font-bold text-sm rounded-xl hover:bg-[#c5ef00] transition-colors"
            >
              Contactarnos
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
