import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

const EVENTOS_PERMITIDOS = [
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Contact',
];

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
}
