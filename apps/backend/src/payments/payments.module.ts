import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsReconciliationService } from './payments.reconciliation';
import { PricingModule } from '../pricing/pricing.module';
import { CouponsModule } from '../coupons/coupons.module';
import { AbandonedCartsModule } from '../abandoned-carts/abandoned-carts.module';

@Module({
  imports: [PricingModule, CouponsModule, AbandonedCartsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsReconciliationService],
})
export class PaymentsModule {}
