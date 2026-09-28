import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

/** Favoritos que alguien marcó sin sesión: se suman a su cuenta al iniciarla. */
export class SincronizarFavoritosDto {
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) productIds: string[];
}
