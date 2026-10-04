import { PaymentMethod, PaymentState, PaymentKind, Prisma } from '@prisma/client';

interface PedidoAnterior {
  id: string;
  total: number;
  notes: string | null;
  paidAt: Date | null;
  payments: { kind: PaymentKind; status: PaymentState }[];
}

/**
 * Lo que tiene que pasar cuando alguien de la tienda marca un pedido como
 * Pagado en Pedidos (lo típico: confirmar que llegó una transferencia).
 *
 * Antes solo cambiaba `status`: el pago seguía "Pendiente", sin fecha y sin
 * cobro registrado, y Estadísticas (que suma cobros confirmados) no contaba
 * esa venta. Ahora queda igual que una venta cobrada por cualquier otro lado.
 * Si ya hay un cobro confirmado (Mercado Pago, Punto de Venta) no se duplica.
 */
export function datosAlConfirmarPago(anterior: PedidoAnterior, ahora = new Date()) {
  const pedido: Prisma.OrderUpdateInput = { paymentStatus: 'PAID', paidAt: anterior.paidAt ?? ahora };

  const yaCobrado = anterior.payments.some((p) => p.kind === PaymentKind.CHARGE && p.status === PaymentState.CONFIRMED);
  let medio: string | undefined;
  try {
    medio = anterior.notes ? JSON.parse(anterior.notes).paymentMethod : undefined;
  } catch {
    medio = undefined;
  }
  // Solo transferencias: es el único medio que se confirma a mano acá. Los
  // demás ya registran su cobro al acreditarse.
  const cobro: Prisma.PaymentCreateManyInput | null =
    !yaCobrado && medio === 'transfer'
      ? {
          orderId: anterior.id,
          method: PaymentMethod.TRANSFER,
          status: PaymentState.CONFIRMED,
          amount: anterior.total,
          reference: 'Transferencia confirmada en Pedidos',
          receivedAt: ahora,
        }
      : null;

  return { pedido, cobro };
}
