export interface ItemPedido {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; sku: string; images?: string[] };
  variant?: { size?: string | null; color?: string | null } | null;
}

export interface PagoPedido {
  id: string;
  method: string;
  kind: string;
  amount: number;
  status?: string;
  receivedAt?: string;
}

export interface Pedido {
  id: string;
  number: string;
  status: string;
  paymentStatus?: string;
  channel?: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string | null;
  createdAt: string;
  paidAt?: string | null;
  address: string;
  notes?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  buyerName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  paymentMethod?: string | null;
  /** Bolsas de regalo a incluir en el paquete (sin cargo). */
  bolsasRegalo?: number;
  user?: { name: string; email: string } | null;
  seller?: { name: string } | null;
  branch?: { name: string } | null;
  payments?: PagoPedido[];
  items?: ItemPedido[];
  /** Compra de prueba: no suma en el panel ni en Estadísticas, y no va a Meta. */
  isTest?: boolean;
}

/** Etapas de trabajo, como en Tiendanube: qué hay que hacer con cada pedido. */
export type Etapa = 'todos' | 'cobrar' | 'enviar' | 'retirar' | 'enviados' | 'entregados' | 'cancelados';
