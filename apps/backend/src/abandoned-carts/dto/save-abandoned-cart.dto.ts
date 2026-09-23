import { IsString, IsNumber, IsArray, IsOptional, IsEmail, ValidateNested, Min, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AbandonedItemDto {
  @IsString() @MaxLength(60) productId: string;
  @IsString() @MaxLength(60) @IsOptional() variantId?: string;
  @IsNumber() @Min(1) quantity: number;
}

export class SaveAbandonedCartDto {
  @ApiProperty() @IsEmail() @MaxLength(160) email: string;

  @ApiPropertyOptional() @IsString() @MaxLength(120) @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @MaxLength(40) @IsOptional() phone?: string;

  /**
   * Solo qué y cuánto. El nombre y el precio salen de la base: si vinieran del
   * navegador, la lista del backoffice mostraría lo que quisiera quien la mande.
   */
  @ApiProperty({ type: [AbandonedItemDto] })
  @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => AbandonedItemDto)
  items: AbandonedItemDto[];
}
