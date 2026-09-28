interface PedidoCompleto {
  number: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  createdAt: Date;
  items: {
    productId: string;
    quantity: number;
    price: number;
    product: { name: string; slug: string; images: string[] } | null;
  }[];
}

/**
 * Lo que se puede mostrar de un pedido a quien solo tiene el número: estado,
 * montos e ítems. Nada que identifique al comprador (nombre, email,
 * teléfono, domicilio) ni datos internos (notas, vendedor, caja).
 */
export function pedidoSinDatosPersonales(order: PedidoCompleto) {
  return {
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: item.product ? { name: item.product.name, slug: item.product.slug, images: item.product.images } : null,
    })),
  };
}
