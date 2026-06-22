const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const faqs = [
    { category: 'COMPRAS', question: 'Como realizo una compra?', answer: 'Podes comprar directamente desde nuestra web: elegis el producto, lo agregas al carrito y completas el proceso de pago con los metodos disponibles.', order: 1, active: true },
    { category: 'COMPRAS', question: 'Necesito crear una cuenta para comprar?', answer: 'No es obligatorio, podes comprar como invitado. Sin embargo, registrarte te permite hacer seguimiento de tus pedidos y tener acceso a promociones exclusivas.', order: 2, active: true },
    { category: 'COMPRAS', question: 'Como se que mi compra fue exitosa?', answer: 'Una vez completado el pago, recibiras un email de confirmacion con el detalle de tu pedido y el numero de seguimiento.', order: 3, active: true },
    { category: 'ENVIOS', question: 'A que zonas hacen envios?', answer: 'Enviamos a todo el pais a traves de nuestros operadores logisticos. Para CABA y GBA ofrecemos envio express en 24/48 hs.', order: 4, active: true },
    { category: 'ENVIOS', question: 'Cuanto tarda en llegar mi pedido?', answer: 'CABA y GBA: 1 a 3 dias habiles. Interior del pais: 3 a 7 dias habiles segun la zona.', order: 5, active: true },
    { category: 'ENVIOS', question: 'Los envios tienen costo?', answer: 'El costo de envio varia segun la zona y el peso del pedido. Los pedidos superiores a 100.000 tienen envio gratis a CABA y GBA.', order: 6, active: true },
    { category: 'ENVIOS', question: 'Puedo retirar mi pedido en el local?', answer: 'Si, ofrecemos retiro en nuestro local sin costo adicional. Una vez listo, te avisamos por email o WhatsApp.', order: 7, active: true },
    { category: 'PAGOS', question: 'Que medios de pago aceptan?', answer: 'Aceptamos tarjetas de credito (Visa, Mastercard, American Express), tarjetas de debito, Mercado Pago y transferencia bancaria.', order: 8, active: true },
    { category: 'PAGOS', question: 'Puedo pagar en cuotas?', answer: 'Si, ofrecemos hasta 6 cuotas sin interes con las principales tarjetas de credito.', order: 9, active: true },
    { category: 'PAGOS', question: 'Es seguro pagar en la web?', answer: 'Si, todas las transacciones estan protegidas con certificado SSL y procesadas a traves de plataformas seguras certificadas.', order: 10, active: true },
    { category: 'DEVOLUCIONES', question: 'Puedo devolver un producto?', answer: 'Si, tenes 30 dias desde la recepcion del producto para solicitar un cambio o devolucion, siempre que este sin uso y en su embalaje original.', order: 11, active: true },
    { category: 'DEVOLUCIONES', question: 'Como solicito una devolucion?', answer: 'Contactanos por WhatsApp o email con tu numero de pedido y el motivo de la devolucion. Nuestro equipo te guiara en el proceso.', order: 12, active: true },
    { category: 'DEVOLUCIONES', question: 'Me devuelven el dinero?', answer: 'Podes elegir entre cambio por otro producto del mismo valor o reintegro del dinero. El reintegro se procesa en 3 a 5 dias habiles.', order: 13, active: true },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: faq.question },
      update: faq,
      create: { ...faq, id: faq.question },
    });
  }
  console.log('13 FAQs insertadas correctamente');
}

main()
  .catch(console.error)
 .finally(() => prisma.$disconnect());