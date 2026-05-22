// DTO para crear producto
// images: array de URLs (pueden ser rutas locales /uploads/... o URLs externas)
// El slug se genera automáticamente en el servicio, no se incluye aquí

import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() salePrice?: number;
  @ApiProperty() @IsString() sku: string;
  @ApiProperty() @IsNumber() @Min(0) stock: number;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() images?: string[];
  @ApiPropertyOptional() @IsBoolean() @IsOptional() featured?: boolean;
  @ApiProperty() @IsString() categoryId: string;
  @ApiProperty() @IsString() brandId: string;
}
