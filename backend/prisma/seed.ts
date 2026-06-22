// Script de seed para poblar la base de datos con datos iniciales
// Ejecutar con: npm run prisma:seed
// Crea: usuario admin, categorías, marcas y productos de ejemplo

import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Admin user — update: incluye password para que re-correr el seed siempre corrija las credenciales
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@homepadel.com' },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      email: 'admin@homepadel.com',
      password: hashedPassword,
      name: 'Administrador',
      role: Role.ADMIN,
    },
  });

  // Categories
  const paletas = await prisma.category.upsert({
    where: { slug: 'paletas' },
    update: {},
    create: { name: 'Paletas', slug: 'paletas' },
  });
  const zapatillas = await prisma.category.upsert({
    where: { slug: 'zapatillas' },
    update: {},
    create: { name: 'Zapatillas', slug: 'zapatillas' },
  });
  const indumentaria = await prisma.category.upsert({
    where: { slug: 'indumentaria' },
    update: {},
    create: { name: 'Indumentaria', slug: 'indumentaria' },
  });
  const accesorios = await prisma.category.upsert({
    where: { slug: 'accesorios' },
    update: {},
    create: { name: 'Accesorios', slug: 'accesorios' },
  });

  // Brands
  const nox = await prisma.brand.upsert({
    where: { slug: 'nox' },
    update: {},
    create: { name: 'Nox', slug: 'nox' },
  });
  const bullpadel = await prisma.brand.upsert({
    where: { slug: 'bullpadel' },
    update: {},
    create: { name: 'Bullpadel', slug: 'bullpadel' },
  });

  // Sample products
  const products = [
    { name: 'Paleta Nox AT10 Genius 18K', slug: 'paleta-nox-at10-genius-18k', price: 437000, salePrice: 350000, sku: 'NOX-AT10-18K', stock: 15, featured: true, categoryId: paletas.id, brandId: nox.id },
    { name: 'Zapatillas Bullpadel Vertex 23', slug: 'zapatillas-bullpadel-vertex-23', price: 120000, sku: 'BULL-VTX23', stock: 30, featured: true, categoryId: zapatillas.id, brandId: bullpadel.id },
    { name: 'Paleta Bullpadel Hack 03', slug: 'paleta-bullpadel-hack-03', price: 235000, salePrice: 200000, sku: 'BULL-HACK03', stock: 8, featured: true, categoryId: paletas.id, brandId: bullpadel.id },
    { name: 'Remera Bullpadel Basic', slug: 'remera-bullpadel-basic', price: 80000, sku: 'BULL-REM-BASIC', stock: 50, featured: true, categoryId: indumentaria.id, brandId: bullpadel.id },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, description: `Descripción de ${p.name}` },
    });
  }

  
  // FAQs
  const faqs = [
    { question: 'Como realizo una compra?', answer: 'Podes comprar directamente desde nuestra web: elegis el producto, lo agregas al carrito y completas el proceso de pago con los metodos disponibles.', order: 1, active: true },
    { question: 'Necesito crear una cuenta para comprar?', answer: 'No es obligatorio, podes comprar como invitado. Sin embargo, registrarte te permite hacer seguimiento de tus pedidos y tener acceso a promociones exclusivas.', order: 2, active: true },
    { question: 'Hacen envios a todo el pais?', answer: 'Si, enviamos a todo el pais. Para CABA y GBA ofrecemos envio express en 24/48 hs habiles.', order: 3, active: true },
    { question: 'Cuanto tarda en llegar mi pedido?', answer: 'CABA y GBA: 1 a 3 dias habiles. Interior del pais: 3 a 7 dias habiles segun la zona.', order: 4, active: true },
    { question: 'Que medios de pago aceptan?', answer: 'Aceptamos tarjetas de credito, debito, Mercado Pago y transferencia bancaria.', order: 5, active: true },
    { question: 'Puedo pagar en cuotas?', answer: 'Si, ofrecemos hasta 6 cuotas sin interes con las principales tarjetas de credito.', order: 6, active: true },
    { question: 'Es seguro pagar en la web?', answer: 'Si, todas las transacciones estan protegidas con certificado SSL.', order: 7, active: true },
    { question: 'Puedo devolver un producto?', answer: 'Si, tenes 30 dias desde la recepcion del producto para solicitar un cambio o devolucion.', order: 8, active: true },
    { question: 'Como solicito una devolucion?', answer: 'Contactanos por WhatsApp o email con tu numero de pedido y el motivo de la devolucion.', order: 9, active: true },
    { question: 'Me devuelven el dinero?', answer: 'Podes elegir entre cambio por otro producto o reintegro del dinero.', order: 10, active: true },
    { question: 'Los productos tienen garantia?', answer: 'Todos nuestros productos cuentan con garantia del fabricante.', order: 11, active: true },
    { question: 'Como elijo el tamano correcto de paleta?', answer: 'Contamos con una guia de talles detallada.', order: 12, active: true },
    { question: 'Los precios son con IVA incluido?', answer: 'Si, todos nuestros precios publicados incluyen IVA.', order: 13, active: true },
  ];
  for (const faq of faqs) {
    await prisma.fAQ.upsert({ where: { id: faq.question }, update: faq, create: { ...faq, id: faq.question } });
  }
  console.log('Seed completado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
