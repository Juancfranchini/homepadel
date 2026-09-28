import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, Max, MaxLength, MinLength } from 'class-validator';
import { MAX_BOLSAS_REGALO } from '../bolsas-regalo';
import { MetaNavegadorDto } from '../../common/meta/meta-cliente';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @IsString() productId: string;
  @IsString() @IsOptional() variantId?: string;
  @IsNumber() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ enum: ['transfer'] }) @IsIn(['transfer']) paymentMethod: 'transfer';
  @ApiProperty() @IsString() address: string;
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  // P1/P2 — shipping y discount ya NO vienen del cliente: el navegador solo
  // puede sugerir un cupón, nunca un monto. El envío y el descuento se
  // calculan siempre en OrdersService a partir de datos del servidor.
  @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() salesLinkToken?: string;
  @ApiProperty() @IsEmail() buyerEmail: string;
  @ApiProperty() @IsString() @MinLength(8) buyerPhone: string;
  @ApiProperty() @IsString() @MinLength(2) buyerName: string;
  @ApiPropertyOptional({ enum: ['correo_argentino', 'retiro_local', 'flex'] })
  @IsOptional()
  @IsIn(['correo_argentino', 'retiro_local', 'flex'])
  carrier?: 'correo_argentino' | 'retiro_local' | 'flex';
  // Localidad de entrega: con Envío Flex define la zona y el precio.
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) city?: string;
  // Bolsas de regalo pedidas; el servidor las limita a las unidades compradas.
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(MAX_BOLSAS_REGALO) bolsasRegalo?: number;
  // Cookies del Pixel del navegador, para informar la compra a Meta cuando se pague.
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => MetaNavegadorDto) meta?: MetaNavegadorDto;
}
