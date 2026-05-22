// DTO para crear un pedido
// items: array de productos con productId, quantity y price (precio al momento de la compra)
// El precio en items se guarda explícitamente para preservar el historial si el precio cambia

import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @IsString() productId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsNumber() price: number;
}

export class CreateOrderDto {
  @ApiProperty() @IsString() address: string;
  @ApiProperty({ type: [OrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
  @ApiPropertyOptional() @IsNumber() @IsOptional() shipping?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() discount?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;
}
