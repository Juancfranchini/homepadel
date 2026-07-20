import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando seed...\n');

  //  Admin 
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homepadel.com' },
    update: {},
    create: { email: 'admin@homepadel.com', password: hash, name: 'Admin', role: Role.ADMIN },
  });
  console.log(' Admin:', admin.email);

  //  Categorias 
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'paletas' }, update: {}, create: { name: 'Paletas', slug: 'paletas', image: null, order: 1 } }),
    prisma.category.upsert({ where: { slug: 'zapatillas' }, update: {}, create: { name: 'Zapatillas', slug: 'zapatillas', image: null, order: 2 } }),
    prisma.category.upsert({ where: { slug: 'indumentaria' }, update: {}, create: { name: 'Indumentaria', slug: 'indumentaria', image: null, order: 3 } }),
    prisma.category.upsert({ where: { slug: 'accesorios' }, update: {}, create: { name: 'Accesorios', slug: 'accesorios', image: null, order: 4 } }),
    prisma.category.upsert({ where: { slug: 'bolsos' }, update: {}, create: { name: 'Bolsos', slug: 'bolsos', image: null, order: 5 } }),
  ]);
  console.log(' Categorias:', categories.length);

  //  Marcas 
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'babolat' }, update: {}, create: { name: 'Babolat', slug: 'babolat' } }),
    prisma.brand.upsert({ where: { slug: 'bullpadel' }, update: {}, create: { name: 'Bullpadel', slug: 'bullpadel' } }),
    prisma.brand.upsert({ where: { slug: 'adidas' }, update: {}, create: { name: 'Adidas', slug: 'adidas' } }),
    prisma.brand.upsert({ where: { slug: 'nox' }, update: {}, create: { name: 'Nox', slug: 'nox' } }),
    prisma.brand.upsert({ where: { slug: 'head' }, update: {}, create: { name: 'Head', slug: 'head' } }),
    prisma.brand.upsert({ where: { slug: 'wilson' }, update: {}, create: { name: 'Wilson', slug: 'wilson' } }),
  ]);
  console.log(' Marcas:', brands.length);

  //  Productos 
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'paleta-bullpadel-hack-03' },
      update: {},
      create: {
        name: 'Paleta Bullpadel Hack 03',
        slug: 'paleta-bullpadel-hack-03',
        description: 'Paleta de alto rendimiento disenada para jugadores avanzados. Forma diamante con nucleo Multieva y caras de carbono 12K.',
        price: 235000, salePrice: 200000, sku: 'BULL-HACK03', stock: 8,
        images: ['https://images.unsplash.com/photo-1613918431703-aa50889e3be9?w=600'],
        featured: true, isNew: false, isOffer: true,
        categoryId: categories[0].id, brandId: brands[1].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'paleta-babolat-technical-viper' },
      update: {},
      create: {
        name: 'Paleta Babolat Technical Viper',
        slug: 'paleta-babolat-technical-viper',
        description: 'Maxima potencia para jugadores de ataque. Carbono 12K con goma Black EVA.',
        price: 380000, salePrice: 340000, sku: 'BAB-VIPER', stock: 5,
        images: ['https://images.unsplash.com/photo-1613918431703-aa50889e3be9?w=600'],
        featured: true, isNew: true, isOffer: false,
        categoryId: categories[0].id, brandId: brands[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'zapatillas-adidas-adizero' },
      update: {},
      create: {
        name: 'Zapatillas Adidas Adizero',
        slug: 'zapatillas-adidas-adizero',
        description: 'Zapatillas ultraligeras para maximo rendimiento en cancha.',
        price: 120000, salePrice: null, sku: 'ADI-ADIZERO', stock: 20,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
        featured: false, isNew: true, isOffer: false,
        categoryId: categories[1].id, brandId: brands[2].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'overgrip-bullpadel-pack-x3' },
      update: {},
      create: {
        name: 'Overgrip Bullpadel Pack x3',
        slug: 'overgrip-bullpadel-pack-x3',
        description: 'Pack de 3 overgrips de alta absorcion.',
        price: 12000, salePrice: 9900, sku: 'BULL-OVG-3', stock: 100,
        images: ['https://images.unsplash.com/photo-1591492654773-4a2a5b0e2b2e?w=600'],
        featured: false, isNew: false, isOffer: true,
        categoryId: categories[3].id, brandId: brands[1].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'remera-adidas-padel-basic' },
      update: {},
      create: {
        name: 'Remera Adidas Padel Basic',
        slug: 'remera-adidas-padel-basic',
        description: 'Remera basica para entrenamiento con tecnologia Climacool.',
        price: 45000, salePrice: null, sku: 'ADI-REM-BASIC', stock: 50,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
        featured: false, isNew: false, isOffer: false,
        categoryId: categories[2].id, brandId: brands[2].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'bolso-nox-6-palas' },
      update: {},
      create: {
        name: 'Bolso Nox 6 Palas',
        slug: 'bolso-nox-6-palas',
        description: 'Bolso termico con capacidad para 6 palas. Compartimento para zapatillas.',
        price: 89000, salePrice: 75000, sku: 'NOX-BOLSO-6', stock: 15,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
        featured: true, isNew: true, isOffer: true,
        categoryId: categories[4].id, brandId: brands[3].id,
      },
    }),
  ]);
  console.log(' Productos:', products.length);

  //  Banners 
  await prisma.banner.deleteMany();
  await prisma.banner.createMany({
    data: [
      { title: 'Nuevas Paletas 2026', subtitle: 'Tecnologia de punta', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200', ctaText: 'VER COLECCION', link: '/catalogo?categoria=paletas', order: 1 },
      { title: 'Zapatillas en Oferta', subtitle: 'Hasta 40% OFF', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200', ctaText: 'VER OFERTAS', link: '/catalogo?categoria=zapatillas', order: 2 },
      { title: 'Envios Gratis', subtitle: 'En compras +.000', image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200', ctaText: 'COMPRAR AHORA', link: '/catalogo', order: 3 },
    ],
  });
  console.log(' Banners: 3');

  //  FAQ 
  await prisma.fAQ.deleteMany();
  const faqs = [
    { category: 'COMPRAS', question: 'Como realizo una compra?', answer: 'Navega por nuestro catalogo, agrega productos al carrito y finaliza la compra completando tus datos. Recibiras un email de confirmacion.', order: 1 },
    { category: 'COMPRAS', question: 'Puedo modificar o cancelar mi pedido?', answer: 'Podes cancelar sin costo dentro de las 2 horas posteriores a la compra. Luego contactanos por WhatsApp.', order: 2 },
    { category: 'COMPRAS', question: 'Ofrecen factura A?', answer: 'Si, emitimos factura A para responsables inscriptos. Solicitarla al momento de la compra.', order: 3 },
    { category: 'ENVIOS', question: 'Cuanto tarda el envio?', answer: 'CABA y GBA: 24-72hs. Interior: 3-7 dias habiles segun la provincia.', order: 4 },
    { category: 'ENVIOS', question: 'Cual es el costo de envio?', answer: 'Envio gratis en compras superiores a .000. Para compras menores, el costo se calcula en el checkout segun tu codigo postal.', order: 5 },
    { category: 'ENVIOS', question: 'Hacen envios al exterior?', answer: 'Por el momento solo realizamos envios dentro de Argentina.', order: 6 },
    { category: 'PAGOS', question: 'Que metodos de pago aceptan?', answer: 'Tarjetas de credito/debito, Mercado Pago, transferencia bancaria y efectivo en sucursales de pago facil.', order: 7 },
    { category: 'PAGOS', question: 'Ofrecen cuotas sin interes?', answer: 'Si, tenemos cuotas sin interes con tarjetas de credito seleccionadas. Consulta las promociones vigentes en el checkout.', order: 8 },
    { category: 'PAGOS', question: 'Es seguro pagar en la web?', answer: 'Totalmente. Usamos certificado SSL y pasarelas de pago seguras. No almacenamos datos de tarjetas.', order: 9 },
    { category: 'DEVOLUCIONES', question: 'Puedo cambiar un producto?', answer: 'Si, tenes hasta 30 dias para cambios. El producto debe estar sin uso y con etiquetas originales.', order: 10 },
    { category: 'DEVOLUCIONES', question: 'Como solicito un reembolso?', answer: 'Contactanos por WhatsApp o email. Una vez recibido el producto, procesamos el reembolso en 5-10 dias habiles.', order: 11 },
    { category: 'PRODUCTOS', question: 'Los productos tienen garantia?', answer: 'Si, todos nuestros productos tienen garantia oficial del fabricante. Las paletas tienen 6 meses por defectos de fabricacion.', order: 12 },
    { category: 'PRODUCTOS', question: 'Como se cual es mi talle?', answer: 'Tenemos una guia de talles disponible en cada producto. Tambien podes consultarnos por WhatsApp.', order: 13 },
  ];
  await prisma.fAQ.createMany({ data: faqs });
  console.log(' FAQs:', faqs.length);

  //  Testimonios 
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { name: 'Martin Lopez', comment: 'Excelente atencion y productos de primera calidad. La paleta llego en 48hs.', rating: 5, order: 1 },
      { name: 'Sofia Garcia', comment: 'Compre zapatillas y overgrips. Todo perfecto, muy buena comunicacion.', rating: 5, order: 2 },
      { name: 'Diego Torres', comment: 'Los precios son los mejores que encontre. Seguro vuelvo a comprar.', rating: 4, order: 3 },
      { name: 'Lucia Fernandez', comment: 'Me encanto la variedad de marcas. El envio fue rapidisimo.', rating: 5, order: 4 },
      { name: 'Juan Martinez', comment: 'Muy conforme con la compra. La pagina es facil de usar.', rating: 4, order: 5 },
    ],
  });
  console.log(' Testimonios: 5');

  //  Beneficios 
  await prisma.benefit.deleteMany();
  await prisma.benefit.createMany({
    data: [
      { icon: 'Truck', title: 'Envios a todo el pais', description: 'Recibi tu pedido donde estes', order: 1 },
      { icon: 'Shield', title: 'Garantia oficial', description: 'Todos los productos con garantia', order: 2 },
      { icon: 'CreditCard', title: 'Hasta 12 cuotas', description: 'Con tarjetas seleccionadas', order: 3 },
      { icon: 'Headphones', title: 'Soporte personalizado', description: 'Te asesoramos en tu compra', order: 4 },
    ],
  });
  console.log(' Beneficios: 4');

  //  Hero Slides 
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      { title: 'Nueva Coleccion 2026', subtitle: 'Paletas de alto rendimiento', description: 'Descubri las ultimas novedades en paletas profesionales', ctaPrimary: 'VER COLECCION', ctaPrimaryUrl: '/catalogo?categoria=paletas', order: 1 },
      { title: 'Hasta 40% OFF', subtitle: 'En indumentaria y accesorios', description: 'Aprovecha las ofertas de temporada', ctaPrimary: 'VER OFERTAS', ctaPrimaryUrl: '/catalogo?oferta=true', order: 2 },
    ],
  });
  console.log(' Hero Slides: 2');

  //  Site Sections 
  await prisma.siteSection.upsert({
    where: { key: 'branding' },
    update: {},
    create: { key: 'branding', data: { logoHeader: null, logoFooter: null, logoMobile: null, favicon: null } },
  });
  await prisma.siteSection.upsert({
    where: { key: 'instagram' },
    update: {},
    create: { key: 'instagram', data: { title: 'No te pierdas ninguna publicacion', username: '@home.padel', buttonText: 'Seguinos en Instagram', buttonUrl: 'https://instagram.com/home.padel', appId: '', appSecret: '', manualUrls: [] } },
  });
  await prisma.siteSection.upsert({
    where: { key: 'about' },
    update: {},
    create: { key: 'about', data: { title: 'Sobre Home Padel', content: 'Somos una tienda especializada en equipamiento de padel. Trabajamos con las mejores marcas del mercado para ofrecerte productos de calidad al mejor precio.' } },
  });
  await prisma.siteSection.upsert({
    where: { key: 'final-message' },
    update: {},
    create: { key: 'final-message', data: { title: '¿Listo para jugar?', subtitle: 'Encontra todo lo que necesitas en un solo lugar', ctaText: 'VER CATALOGO', ctaUrl: '/catalogo' } },
  });
  console.log(' Site Sections: branding, instagram, about, final-message');

  console.log('\n Seed completado!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
