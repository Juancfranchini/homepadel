const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst();
  if (!product) {
    console.log('No hay productos para asociar al pedido');
    return;
  }

  const order = await prisma.order.create({
    data: {
      number: 'HP-TEST-001',
      status: 'PAID',
      total: 85000,
      subtotal: 80000,
      shipping: 5000,
      discount: 0,
      address: 'Av. Test 123, Buenos Aires, Argentina',
      notes: JSON.stringify({
        buyerName: 'Cliente Test',
        buyerEmail: 'test@homepadel.com',
        buyerPhone: '5491123456789',
        paymentMethod: 'Mercado Pago'
      }),
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            price: 80000
          }
        ]
      }
    }
  });
  console.log('Pedido creado:', order.id, order.number);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
