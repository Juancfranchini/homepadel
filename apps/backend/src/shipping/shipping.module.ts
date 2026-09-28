import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { EnvioFlexController } from './envio-flex.controller';

@Module({
  controllers: [ShippingController, EnvioFlexController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}