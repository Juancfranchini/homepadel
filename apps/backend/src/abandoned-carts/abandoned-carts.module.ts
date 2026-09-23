import { Module } from '@nestjs/common';
import { AbandonedCartsController } from './abandoned-carts.controller';
import { AbandonedCartsService } from './abandoned-carts.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  controllers: [AbandonedCartsController],
  providers: [AbandonedCartsService],
  exports: [AbandonedCartsService],
})
export class AbandonedCartsModule {}
