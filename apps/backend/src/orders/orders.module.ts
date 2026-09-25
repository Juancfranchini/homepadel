// Módulo de pedidos

import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PricingModule } from '../pricing/pricing.module';
import { CouponsModule } from '../coupons/coupons.module';
import { AbandonedCartsModule } from '../abandoned-carts/abandoned-carts.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [PricingModule, CouponsModule, AbandonedCartsModule, InventoryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
