// S3 / F6 — Resolución de precios y control de stock
//
// El checkout tiene dos caminos (orden directa y Mercado Pago) y ambos tienen
// que calcular lo mismo: cuánto vale realmente cada producto y si hay unidades
// disponibles. Tenerlo en un único lugar evita que una corrección futura vuelva
// a cubrir solo la mitad del recorrido.
//
// Regla de oro: del cliente se acepta QUÉ quiere comprar y CUÁNTAS unidades.
// El precio sale siempre de la base de datos.

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryContext, InventoryService } from '../inventory/inventory.service';
import { effectivePrice, precioPorTransferencia } from './effective-price';
import { configFlex, zonaFlexDe } from '../shipping/envio-flex';

export interface RequestedItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ResolvedItem {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  /** Con reserva activada no se descuenta stock: lo que se vende no está en el local. */
  isMadeToOrder?: boolean;
}

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService = new InventoryService(prisma),
  ) {}

  /**
   * Toma los ítems que llegaron del navegador y devuelve la versión confiable:
   * precio tomado de la base y stock verificado. Descarta cualquier precio que
   * venga en la petición.
   */
  /**
   * `porTransferencia`: el pedido se paga por transferencia, así que cada
   * producto sale a su precio de transferencia (ver precioPorTransferencia).
   * Antes la tienda lo mostraba pero el pedido se cobraba al precio de lista.
   */
  async resolveItems(items: RequestedItem[], opciones: { porTransferencia?: boolean } = {}): Promise<ResolvedItem[]> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ConflictException('El pedido no tiene productos');
    }

    return Promise.all(
      items.map(async (item) => {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new ConflictException('Cantidad inválida en el pedido');
        }

        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            price: true,
            salePrice: true,
            transferPrice: true,
            stock: true,
            active: true,
            isMadeToOrder: true,
            // Sin variante elegida solo interesan las que el comprador
            // podría haber elegido: activas y que no sean la "base". Cada
            // producto tiene una variante base persistida que no se muestra
            // en ningún lado; al contarla, este bloque daba por hecho que
            // faltaba elegir una y rechazaba el pedido. Cualquier producto
            // agregado desde el catálogo era incomprable.
            variants: {
              where: item.variantId ? { id: item.variantId } : { active: true, isDefault: false },
              select: { id: true, stock: true, active: true },
            },
          },
        });

        if (!product) {
          throw new NotFoundException(`El producto ${item.productId} no existe`);
        }
        if (!product.active) {
          throw new ConflictException(`"${product.name}" ya no está disponible`);
        }
        if (product.variants.length > 0 && !item.variantId) {
          throw new ConflictException(`Debes seleccionar una variante de "${product.name}"`);
        }
        const variant = item.variantId ? product.variants[0] : null;
        if (item.variantId && !variant) {
          throw new NotFoundException(`La variante ${item.variantId} no pertenece al producto`);
        }
        if (variant && !variant.active) {
          throw new ConflictException(`La variante de "${product.name}" ya no está disponible`);
        }
        // Con la reserva activada el stock no interviene: la tienda toma la
        // seña y lo trae. El stock que se lleva es el del local y no dice nada
        // sobre lo que se puede encargar afuera.
        if (!product.isMadeToOrder) {
          const availableStock = variant ? variant.stock : product.stock;
          if (availableStock < quantity) {
            throw new ConflictException(
              `Quedan ${availableStock} unidades de "${product.name}" y pediste ${quantity}`,
            );
          }
        }

        return {
          productId: item.productId,
          variantId: item.variantId,
          name: product.name,
          quantity,
          price: opciones.porTransferencia
            ? precioPorTransferencia(product.price, product.salePrice, product.transferPrice)
            : effectivePrice(product.price, product.salePrice),
          isMadeToOrder: product.isMadeToOrder,
        };
      }),
    );
  }

  /**
   * Descuenta stock de forma atómica. La condición `stock >= quantity` viaja
   * dentro del propio UPDATE, así dos compras simultáneas de la última unidad
   * no pueden pasar las dos: la segunda no afecta ninguna fila y se rechaza.
   */
  async decrementStock(items: ResolvedItem[], context: InventoryContext = {}): Promise<void> {
    await this.inventory.deduct(items, context);
  }

  /**
   * P1 — Costo de envío calculado en el servidor a partir de la tarifa
   * configurada en el backoffice (`site-sections` / `shipping_rates`).
   * El monto que mande el navegador en `shipping` se ignora siempre: si no,
   * cualquiera puede POSTear una orden con envío en cero.
   *
   * Retiro en el local es gratis siempre, sin importar el subtotal: no hay
   * ningún envío que cobrar.
   *
   * Envío Flex se cobra por zona según la localidad del cliente, sin envío
   * gratis: el kiosco cobra cada envío. Si la localidad no está en ninguna
   * zona (o Flex está apagado) el pedido no se puede crear.
   */
  async calculateShipping(subtotal: number, carrier?: string, localidad?: string): Promise<number> {
    if (carrier === 'retiro_local') return 0;

    const section = await this.prisma.siteSection.findUnique({ where: { key: 'shipping_rates' } });
    const data = (section?.data as { flatRate?: number; freeShippingThreshold?: number; flex?: unknown }) ?? {};
    if (carrier === 'flex') return this.costoFlex(data.flex, localidad);
    const flatRate = Number(data.flatRate ?? 4500);
    const threshold = Number(data.freeShippingThreshold ?? 100000);
    return subtotal >= threshold ? 0 : flatRate;
  }

  private costoFlex(guardado: unknown, localidad?: string): number {
    const config = configFlex(guardado);
    if (!config.activo) throw new BadRequestException('El Envío Flex no está disponible en este momento.');
    const zona = zonaFlexDe(localidad);
    if (!zona) throw new BadRequestException('El Envío Flex no llega a esa localidad. Elegí otra forma de envío.');
    return config.precios[zona];
  }
}
