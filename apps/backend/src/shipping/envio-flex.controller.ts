import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { configFlex, LOCALIDADES_FLEX, ZonaFlex } from './envio-flex';

/**
 * Público: la tienda lo usa para listar las localidades con Envío Flex y su
 * precio. El monto que se cobra lo vuelve a calcular el servidor
 * (PricingService.calculateShipping), esto es solo para mostrarlo.
 */
@ApiTags('Shipping')
@Controller('envio-flex')
export class EnvioFlexController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async zonas() {
    const section = await this.prisma.siteSection.findUnique({ where: { key: 'shipping_rates' } });
    const config = configFlex((section?.data as { flex?: unknown } | null)?.flex);
    const zonas = ([1, 2, 3] as ZonaFlex[]).map((zona) => ({
      zona,
      precio: config.precios[zona],
      localidades: LOCALIDADES_FLEX[zona],
    }));
    return { activo: config.activo, zonas };
  }
}
