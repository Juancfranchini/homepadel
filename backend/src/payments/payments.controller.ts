import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(@Body() body: {
    orderNumber: string;
    items: { productId: string; name: string; quantity: number; variantId?: string }[];
    payer: { name: string; email: string };
    externalReference: string;
  }) {
    return this.paymentsService.createPreference(body.orderNumber, body.items, body.payer, body.externalReference);
  }

  @Post('webhook')
  async webhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    console.log('Webhook MP:', JSON.stringify(body));
    await this.paymentsService.handleWebhook(body, signature || '', xRequestId || '');
    return { status: 'ok' };
  }
}