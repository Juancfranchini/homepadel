import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsReconciliationService } from './payments.reconciliation';
import { PricingModule } from '../pricing/pricing.module';
import { CouponsModule } from '../coupons/coupons.module';
import { AbandonedCartsModule } from '../abandoned-carts/abandoned-carts.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentsSettlementService } from './payments-settlement.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PricingModule, CouponsModule, AbandonedCartsModule, InventoryModule, EmailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsReconciliationService, PaymentsSettlementService],
})
export class PaymentsModule {}
