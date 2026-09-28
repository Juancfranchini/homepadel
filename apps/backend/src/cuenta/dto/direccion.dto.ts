import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Dirección de entrega guardada en la cuenta del cliente. */
export class DireccionDto {
  @ApiPropertyOptional({ example: 'Casa' }) @IsOptional() @IsString() @MaxLength(40) label?: string;
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(200) street: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) city: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) province: string;
  @ApiProperty() @IsString() @Matches(/^[A-Za-z0-9]{4,8}$/, { message: 'Código postal inválido' }) postalCode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(/^[0-9+\s()-]{8,40}$/, { message: 'Teléfono inválido' }) phone?: string;
}
