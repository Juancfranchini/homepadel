import { IsString, IsNumber, IsArray, IsOptional, IsEmail, IsIn, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsString() @MaxLength(200) street: string;
  @IsString() @MaxLength(100) city: string;
  @IsString() @MaxLength(100) province: string;
  @IsString() @MaxLength(20) postalCode: string;
  @IsString() @MaxLength(40) phone: string;
  @IsOptional() @IsIn(['correo_argentino']) carrier?: 'correo_argentino';
}

export class CreatePreferenceDto {
  @ApiProperty({ type: [PreferenceItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PreferenceItemDto)
  items: PreferenceItemDto[];

  @ApiProperty({ type: PayerDto })
  @ValidateNested() @Type(() => PayerDto)
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
  @IsOptional() @ValidateNested() @Type(() => ShippingDto)
  shipping?: ShippingDto;

  @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;

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
