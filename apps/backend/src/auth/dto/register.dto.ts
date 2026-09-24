// DTO para registro de nuevo usuario
// Valida que name sea string, email sea válido y password tenga al menos 6 caracteres

import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) @MaxLength(72) password: string;
}
