import { Controller, Post, Get, Body, Query, Headers, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto, ConfirmOrderDto } from './dto/create-preference.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(@Body() dto: CreatePreferenceDto) {
    return this.paymentsService.createPreference(dto);
  }

  /**
   * Confirma una orden preguntándole a Mercado Pago, sin esperar su aviso.
   *
   * Lo llama la tienda cuando el comprador vuelve del pago. El navegador solo
   * manda un número de orden: quién decide si está pagada es Mercado Pago,
   * consultado desde el servidor con el token del vendedor. Conocer un número
   * ajeno no sirve para dar nada por pagado.
   */
  @Post('confirm')
  async confirm(@Body() dto: ConfirmOrderDto) {
    return this.paymentsService.confirmarOrden(dto.orderNumber);
  }

  /**
   * Aviso de pago de Mercado Pago.
   *
   * Se acepta también por GET: la modalidad IPN manda los datos en la query
   * string y, según cómo esté configurada la cuenta, puede llegar por
   * cualquiera de los dos métodos. Antes solo había POST y el aviso se perdía.
   */
  @Post('webhook')
  async webhook(
    @Query() query: Record<string, string>,
    @Body() body: any,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    this.logger.log(`Aviso de Mercado Pago — query: ${JSON.stringify(query)} | cuerpo: ${JSON.stringify(body)}`);
    await this.paymentsService.handleWebhook(body, signature || '', xRequestId || '', query);
    return { status: 'ok' };
  }

  @Get('webhook')
  async webhookGet(
    @Query() query: Record<string, string>,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    this.logger.log(`Aviso de Mercado Pago (GET) — query: ${JSON.stringify(query)}`);
    await this.paymentsService.handleWebhook({}, signature || '', xRequestId || '', query);
    return { status: 'ok' };
  }
}