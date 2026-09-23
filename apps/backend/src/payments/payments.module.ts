import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsReconciliationService } from './payments.reconciliation';
import { PricingModule } from '../pricing/pricing.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [PricingModule, CouponsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsReconciliationService],
})
export class PaymentsModule {}
