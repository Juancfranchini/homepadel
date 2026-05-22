// DTO para crear categoría
// image: URL o ruta local de la imagen de la categoría (opcional)

import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsString() @IsOptional() image?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() active?: boolean;
}
