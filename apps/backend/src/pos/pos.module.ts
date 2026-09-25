import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { PricingModule } from '../pricing/pricing.module';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { PosController, PublicSalesLinksController } from './pos.controller';
import { PosCartsService } from './pos-carts.service';
import { PosPaymentsService } from './pos-payments.service';
import { PosReturnsService } from './pos-returns.service';
import { PosSalesService } from './pos-sales.service';
import { PosStatsService } from './pos-stats.service';
import { SalesLinksService } from './sales-links.service';

@Module({
  imports: [PricingModule, InventoryModule],
  controllers: [PosController, PublicSalesLinksController],
  providers: [
    PermissionsGuard,
    PosSalesService,
    PosPaymentsService,
    PosReturnsService,
    PosCartsService,
    PosStatsService,
    SalesLinksService,
  ],
  exports: [PosPaymentsService],
})
export class PosModule {}
