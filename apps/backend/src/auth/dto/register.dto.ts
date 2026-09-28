// DTO para registro de nuevo usuario
// Valida que name sea string, email sea válido y password tenga al menos 6 caracteres.
// acceptTerms es obligatorio y tiene que ser true; acceptMarketing es opcional
// (si viene en true, el email se suscribe al newsletter).

import { Equals, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) @MaxLength(72) password: string;
  @ApiProperty() @Equals(true, { message: 'Tenés que aceptar los términos y condiciones' }) acceptTerms: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() acceptMarketing?: boolean;
}
