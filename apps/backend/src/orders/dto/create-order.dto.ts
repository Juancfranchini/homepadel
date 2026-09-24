import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @IsString() productId: string;
  @IsString() @IsOptional() variantId?: string;
  @IsNumber() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ enum: ['transfer'] }) @IsIn(['transfer']) paymentMethod: 'transfer';
  @ApiProperty() @IsString() address: string;
  @ApiProperty({ type: [OrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
  // P1/P2 — shipping y discount ya NO vienen del cliente: el navegador solo
  // puede sugerir un cupón, nunca un monto. El envío y el descuento se
  // calculan siempre en OrdersService a partir de datos del servidor.
  @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;
  @ApiProperty() @IsEmail() buyerEmail: string;
  @ApiProperty() @IsString() @MinLength(8) buyerPhone: string;
  @ApiProperty() @IsString() @MinLength(2) buyerName: string;
}
