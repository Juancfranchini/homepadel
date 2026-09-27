import { IsIn, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const EVENTOS_PERMITIDOS = [
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Contact',
];

/**
 * Datos del comprador para mejorar la coincidencia en Meta. Llegan en claro
 * desde el checkout (como el resto del pedido) y el servidor los cifra antes
 * de mandarlos; no se guardan. Un email mal escrito no rechaza el evento: se
 * descarta solo ese dato al normalizarlo.
 */
export class TrackUserDataDto {
  @IsOptional()
  @IsString()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}

export class TrackEventDto {
  @IsIn(EVENTOS_PERMITIDOS)
  eventName: string;

  @IsString()
  @MaxLength(200)
  eventId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  eventSourceUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  pixelId?: string;

  // Forma libre a propósito: cada evento manda campos distintos (content_ids,
  // value, num_items...) y Meta los reenvía tal cual dentro de custom_data.
  @IsOptional()
  @IsObject()
  eventData?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  customData?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => TrackUserDataDto)
  userData?: TrackUserDataDto;
}
