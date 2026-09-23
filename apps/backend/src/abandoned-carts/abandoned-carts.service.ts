import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { SaveAbandonedCartDto } from './dto/save-abandoned-cart.dto';

/** Un carrito más viejo que esto ya no se recupera: se deja de listar. */
const DIAS_VIGENCIA = 30;

@Injectable()
export class AbandonedCartsService {
  private readonly logger = new Logger(AbandonedCartsService.name);

  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
  ) {}

  /**
   * Guarda el carrito de alguien que dejó su email en el checkout y todavía no
   * compró. Se llama mientras completa el formulario, así que puede repetirse:
   * hay una sola fila por email y se va actualizando.
   *
   * El nombre y el precio de cada producto se resuelven contra la base. Si
   * salieran de lo que manda el navegador, cualquiera podría llenar la lista
   * del backoffice con productos y montos inventados.
   */
  async save(dto: SaveAbandonedCartDto) {
    const email = dto.email.trim().toLowerCase();

    let resolvedItems;
    try {
      resolvedItems = await this.pricing.resolveItems(
        dto.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
    } catch (err) {
      // Un carrito con algo sin stock o ya dado de baja no es motivo para
      // fallar: esto no cobra nada, solo registra una intención de compra.
      this.logger.warn(`Carrito abandonado de ${email} con ítems no resolubles: ${err}`);
      return { saved: false };
    }

    const items = resolvedItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const datos = {
      name: dto.name?.trim() || null,
      phone: dto.phone?.trim() || null,
      items: items as unknown as Prisma.InputJsonValue,
      total,
    };

    await this.prisma.abandonedCart.upsert({
      where: { email },
      update: datos,
      create: { email, ...datos },
    });

    return { saved: true };
  }

  /**
   * Marca como recuperado el carrito de quien terminó comprando.
   *
   * No se borra: así el backoffice puede mostrar cuántos carritos abandonados
   * terminaron en venta, que es el número que dice si vale la pena seguir
   * contactando gente.
   */
  async markRecovered(email: string | null | undefined, orderNumber: string): Promise<void> {
    if (!email) return;
    try {
      await this.prisma.abandonedCart.updateMany({
        where: { email: email.trim().toLowerCase(), recoveredAt: null },
        data: { recoveredAt: new Date(), orderNumber },
      });
    } catch (err) {
      // La venta ya está hecha: que falle esto no puede romperla.
      this.logger.warn(`No se pudo marcar el carrito recuperado de ${email}: ${err}`);
    }
  }

  /** Los que siguen sin comprar, del más reciente al más viejo. */
  async findPending() {
    const desde = new Date(Date.now() - DIAS_VIGENCIA * 24 * 60 * 60 * 1000);
    return this.prisma.abandonedCart.findMany({
      where: { recoveredAt: null, updatedAt: { gte: desde } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  /** Cuántos se abandonaron, cuántos se rescataron y cuánta plata representa. */
  async stats() {
    const desde = new Date(Date.now() - DIAS_VIGENCIA * 24 * 60 * 60 * 1000);
    const [pendientes, recuperados, sumaPendiente] = await Promise.all([
      this.prisma.abandonedCart.count({ where: { recoveredAt: null, updatedAt: { gte: desde } } }),
      this.prisma.abandonedCart.count({ where: { recoveredAt: { not: null }, updatedAt: { gte: desde } } }),
      this.prisma.abandonedCart.aggregate({
        where: { recoveredAt: null, updatedAt: { gte: desde } },
        _sum: { total: true },
      }),
    ]);

    return {
      pendientes,
      recuperados,
      montoPendiente: sumaPendiente._sum.total ?? 0,
      dias: DIAS_VIGENCIA,
    };
  }

  /** Deja constancia de que alguien de la tienda ya se comunicó. */
  async markContacted(id: string) {
    const carrito = await this.prisma.abandonedCart.findUnique({ where: { id } });
    if (!carrito) throw new NotFoundException('Ese carrito no existe.');

    return this.prisma.abandonedCart.update({
      where: { id },
      data: { contactedAt: carrito.contactedAt ? null : new Date() },
    });
  }

  async remove(id: string) {
    await this.prisma.abandonedCart.delete({ where: { id } });
    return { deleted: true };
  }
}
