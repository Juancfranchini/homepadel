import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [PrismaModule, InventoryModule],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
