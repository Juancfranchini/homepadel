import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

/** Cada cuánto se barren las órdenes pendientes. */
const INTERVALO_MS = 10 * 60 * 1000;

/** Margen antes de revisar una orden: recién creada todavía no se pagó. */
const ANTIGUEDAD_MINIMA_MS = 3 * 60 * 1000;

/** Hasta dónde se mira hacia atrás. Más viejo que esto ya es un carrito abandonado. */
const VENTANA_MS = 48 * 60 * 60 * 1000;

/** Tope por pasada, para no castigar a la API de Mercado Pago ni a la base. */
const MAXIMO_POR_PASADA = 40;

/**
 * Repasa las órdenes pendientes y le pregunta a Mercado Pago si se pagaron.
 *
 * Cierra el último hueco del cobro: la tienda confirma el pago cuando el
 * comprador vuelve del checkout, pero si cierra la pestaña y no vuelve, nadie
 * pregunta. Esa orden quedaba pendiente para siempre —con el stock sin
 * descontar y el cupón sin consumir— hasta que alguien la mirara a mano.
 *
 * Es seguro repetirlo: confirmar una orden ya registrada no vuelve a descontar
 * stock ni a consumir el cupón, así que dos instancias del servidor barriendo
 * a la vez no hacen daño.
 */
@Injectable()
export class PaymentsReconciliationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsReconciliationService.name);
  private temporizador?: ReturnType<typeof setInterval>;
  private corriendo = false;

  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  onModuleInit(): void {
    this.temporizador = setInterval(() => { void this.reconciliar(); }, INTERVALO_MS);
    // `unref` evita que el temporizador mantenga vivo el proceso: sin esto, el
    // contenedor no termina de cerrar cuando se despliega una versión nueva.
    this.temporizador.unref?.();
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  async reconciliar(): Promise<{ revisadas: number; confirmadas: number }> {
    // Una pasada lenta no debe encimarse con la siguiente.
    if (this.corriendo) return { revisadas: 0, confirmadas: 0 };
    this.corriendo = true;

    try {
      const ahora = Date.now();
      const pendientes = await this.prisma.order.findMany({
        where: {
          status: 'PENDING',
          createdAt: { gte: new Date(ahora - VENTANA_MS), lte: new Date(ahora - ANTIGUEDAD_MINIMA_MS) },
          // Solo las de Mercado Pago: son las que tienen referencia para consultar.
          notes: { contains: 'externalReference' },
        },
        select: { number: true },
        orderBy: { createdAt: 'desc' },
        take: MAXIMO_POR_PASADA,
      });

      let confirmadas = 0;
      for (const orden of pendientes) {
        const resultado = await this.payments.confirmarOrden(orden.number);
        if (resultado.confirmada) confirmadas++;
      }

      if (confirmadas > 0) {
        this.logger.log(`Reconciliación: ${confirmadas} de ${pendientes.length} órdenes pendientes estaban pagadas.`);
      }
      return { revisadas: pendientes.length, confirmadas };
    } catch (err) {
      this.logger.error(`Error reconciliando órdenes pendientes: ${err}`);
      return { revisadas: 0, confirmadas: 0 };
    } finally {
      this.corriendo = false;
    }
  }
}
