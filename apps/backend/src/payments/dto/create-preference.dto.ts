import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEmail,
  IsIn,
  ValidateNested,
  Min,
  MaxLength,
  Matches,
  IsInt,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_BOLSAS_REGALO } from '../../orders/bolsas-regalo';
import { MetaNavegadorDto } from '../../common/meta/meta-cliente';

class PreferenceItemDto {
  @IsString() productId: string;
  @IsString() @IsOptional() variantId?: string;
  @IsNumber() @Min(1) quantity: number;

  // El navegador manda además el nombre y los datos de la variante para
  // mostrarlos en su propia pantalla. Se aceptan para no rechazar el pedido
  // entero (forbidNonWhitelisted), pero el precio y el nombre que se cobran
  // salen de la base: ver PricingService.resolveItems.
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() variantSku?: string;
  @IsString() @IsOptional() variantSize?: string;
  @IsString() @IsOptional() variantColor?: string;
  @IsString() @IsOptional() variantDimensions?: string;
}

class PayerDto {
  @IsString() @MaxLength(120) name: string;
  @IsEmail() email: string;
}

class ShippingDto {
  // Con retiro en el local no hace falta domicilio: opcionales a propósito,
  // ver PaymentsService.formatAddress.
  @IsOptional() @IsString() @MaxLength(200) street?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(100) province?: string;
  @IsOptional() @IsString() @MaxLength(20) postalCode?: string;
  @IsString() @MaxLength(40) phone: string;
  @IsOptional() @IsIn(['correo_argentino', 'retiro_local', 'flex', 'andreani']) carrier?: 'correo_argentino' | 'retiro_local' | 'flex' | 'andreani';
}

export class CreatePreferenceDto {
  @ApiProperty({ type: [PreferenceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceItemDto)
  items: PreferenceItemDto[];

  @ApiProperty({ type: PayerDto })
  @ValidateNested()
  @Type(() => PayerDto)
  payer: PayerDto;

  /**
   * Domicilio de entrega. Opcional a propósito: frontend y backend se
   * despliegan por separado, y durante esa ventana convive una versión del
   * navegador que todavía no lo manda. Sin domicilio la orden se registra
   * igual, pero queda marcada como "sin domicilio" para que la tienda lo
   * pida — antes se guardaba literalmente "Pendiente de pago" y la venta
   * quedaba sin dirección a la que enviar.
   */
  @ApiPropertyOptional({ type: ShippingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingDto)
  shipping?: ShippingDto;

  @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() salesLinkToken?: string;

  // Bolsas de regalo pedidas; el servidor las limita a las unidades compradas.
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(MAX_BOLSAS_REGALO) bolsasRegalo?: number;

  // Id fijo del intento de compra en el navegador: reintentar no crea otro pedido (ver checkout-intento.ts).
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64) @Matches(/^[\w-]+$/) checkoutId?: string;

  // Cookies del Pixel del navegador, para informar la compra a Meta cuando Mercado Pago confirme el pago.
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => MetaNavegadorDto) meta?: MetaNavegadorDto;

  // Se aceptan por compatibilidad con el frontend anterior y se descartan: el
  // número de orden y la referencia externa los genera el servidor. Que los
  // eligiera el navegador permitía repetirlos o pisar una orden ajena.
  @ApiPropertyOptional() @IsString() @IsOptional() orderNumber?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() externalReference?: string;
}

export type ShippingData = ShippingDto;

export class ConfirmOrderDto {
  @ApiProperty()
  @IsString()
  @MaxLength(60)
  orderNumber: string;
}
