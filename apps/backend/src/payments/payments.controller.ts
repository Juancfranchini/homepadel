import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(@Body() dto: CreatePreferenceDto) {
    return this.paymentsService.createPreference(dto);
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