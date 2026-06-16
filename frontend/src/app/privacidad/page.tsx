import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | Home Pádel',
  description: 'Conocé cómo recopilamos, usamos y protegemos tus datos personales.',
};

const SECTIONS = [
  {
    title: '1. Información que recopilamos',
    content: `Recopilamos la información que nos proporcionás al realizar una compra, crear una cuenta o contactarnos:

• Datos de identificación: nombre, apellido, DNI (cuando aplique).
• Datos de contacto: email, número de teléfono, dirección de envío.
• Datos de pago: procesados de forma segura a través de plataformas certificadas. No almacenamos datos de tarjetas de crédito/débito.
• Datos de navegación: cookies técnicas necesarias para el funcionamiento del sitio.`,
  },
  {
    title: '2. Cómo utilizamos tu información',
    content: `Utilizamos tus datos personales exclusivamente para:

• Procesar y gestionar tus pedidos.
• Enviarte confirmaciones y actualizaciones sobre tu compra.
• Brindarte soporte al cliente.
• Enviarte comunicaciones de marketing (solo si lo autorizaste expresamente).
• Cumplir con obligaciones legales.`,
  },
  {
    title: '3. Compartir información con terceros',
    content: `No vendemos, alquilamos ni compartimos tus datos personales con terceros, salvo en los siguientes casos:

• Operadores logísticos: compartimos datos de entrega para efectuar el envío de tus pedidos.
• Procesadores de pago: Mercado Pago y otras pasarelas procesan los pagos de forma segura.
• Autoridades: cuando sea requerido por ley o resolución judicial.`,
  },
  {
    title: '4. Seguridad de los datos',
    content: `Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales:

• Cifrado SSL en todas las comunicaciones del sitio.
• Acceso restringido a los datos de los clientes.
• Plataformas de pago certificadas PCI-DSS.
• Revisión periódica de nuestras prácticas de seguridad.`,
  },
  {
    title: '5. Cookies',
    content: `Utilizamos cookies técnicas necesarias para el funcionamiento del sitio (sesión, carrito de compras) y cookies de análisis (con tu consentimiento) para mejorar la experiencia.

Podés configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.`,
  },
  {
    title: '6. Tus derechos',
    content: `De acuerdo con la Ley 25.326 de Protección de Datos Personales (Argentina), tenés derecho a:

• Acceder a tus datos personales.
• Rectificar datos inexactos o incompletos.
• Eliminar tus datos cuando no sean necesarios para el fin que fueron recopilados.
• Revocar el consentimiento para comunicaciones de marketing.

Para ejercer estos derechos, contactanos en privacidad@homepadel.com.ar.`,
  },
  {
    title: '7. Retención de datos',
    content: `Conservamos tus datos personales durante el tiempo necesario para cumplir los fines descritos en esta política y para cumplir con nuestras obligaciones legales (generalmente 5 años desde la última transacción).`,
  },
  {
    title: '8. Cambios en esta política',
    content: `Podemos actualizar esta política de privacidad periódicamente. Te notificaremos cualquier cambio significativo a través de un aviso en el sitio o por email. La fecha de última actualización se indica al final de este documento.`,
  },
  {
    title: '9. Contacto',
    content: `Si tenés preguntas sobre esta política o sobre el tratamiento de tus datos personales, podés contactarnos en:

Email: privacidad@homepadel.com.ar
Dirección: Buenos Aires, Argentina`,
  },
];

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#050606] text-white">

      {/* BREADCRUMB */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white">Política de Privacidad</span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-14">
        <p className="text-[#B7D31A] text-xs font-black uppercase tracking-[0.2em] mb-3">LEGAL</p>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          Política de Privacidad
        </h1>
        <p className="text-[#A1A1AA] text-sm">Última actualización: enero 2026</p>
        <p className="text-[#A1A1AA] text-base leading-relaxed mt-4">
          En Home Pádel nos comprometemos a proteger la privacidad y seguridad de tus datos personales.
          Esta política describe cómo recopilamos, usamos y protegemos tu información.
        </p>
      </section>

      {/* CONTENIDO */}
      <section className="border-t border-white/[0.06] py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <div key={i} className="bg-[#0C0C0C] border border-white/[0.08] rounded-2xl p-6 md:p-8">
                <h2 className="text-white font-black text-base mb-4">{section.title}</h2>
                <div className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#B7D31A]/5 border border-[#B7D31A]/20 rounded-2xl p-6 text-center">
            <p className="text-[#B7D31A] font-black text-sm mb-1">¿Tenés preguntas sobre tu privacidad?</p>
            <p className="text-[#A1A1AA] text-sm mb-4">Contactanos y te responderemos en menos de 48 hs hábiles.</p>
            <a
              href="mailto:privacidad@homepadel.com.ar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B7D31A] text-[#050606] font-black text-sm rounded-xl hover:bg-[#c5ef00] transition-colors"
            >
              privacidad@homepadel.com.ar
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
