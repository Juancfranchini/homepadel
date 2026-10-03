import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { armarFeedCsv } from './catalog-feed.csv';

/**
 * GET /api/catalog-feed/meta.csv — feed público de productos para Meta.
 *
 * Se arma en cada pedido desde la base, así que un cambio de precio o de
 * stock ya sale la próxima vez que Meta lo lee (lo programa cada hora o cada
 * día en la fuente de datos). Público a propósito: solo trae lo que ya se ve
 * en la tienda, y únicamente productos activos.
 */
@ApiTags('Catalog feed')
@Controller('catalog-feed')
export class CatalogFeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('meta.csv')
  // Meta lo pide desde varios servidores a la vez: no tiene que chocar con el
  // límite de pedidos pensado para visitantes.
  @SkipThrottle()
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=900')
  async metaCsv(): Promise<string> {
    const productos = await this.prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        salePrice: true,
        stock: true,
        isMadeToOrder: true,
        images: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        variants: { select: { stock: true, active: true, isDefault: true } },
      },
    });
    const sitio = (process.env.FRONTEND_URL || 'https://www.homepadel.com.ar').replace(/\/+$/, '');
    const backend = (process.env.BACKEND_URL || '').replace(/\/+$/, '');
    return armarFeedCsv(productos, sitio, backend);
  }
}
