import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(@Body() body: {
    orderNumber: string;
    items: { productId: string; name: string; quantity: number; price: number }[];
    payer: { name: string; email: string };
    externalReference: string;
  }) {
    return this.paymentsService.createPreference(body.orderNumber, body.items, body.payer, body.externalReference);
  }

  @Post('webhook')
  async webhook(@Req() req: any, @Body() body: any) {
    console.log('Webhook MP:', JSON.stringify(body));
    await this.paymentsService.handleWebhook(body);
    return { status: 'ok' };
  }
}
