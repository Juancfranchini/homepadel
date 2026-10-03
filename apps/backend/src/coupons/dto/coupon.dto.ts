import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export const TIPOS_CUPON = ['PERCENTAGE', 'FIXED'] as const;

/** '' o null en un campo opcional = sin valor (el backoffice manda '' al vaciar un input). */
const vacioANull = ({ value }: { value: unknown }) => (value === '' ? null : value);

/**
 * Alta y edición de cupones (solo ADMIN). Antes llegaba `any` y se guardaba
 * tal cual: un descuento negativo, un 500% o un campo inventado pasaban.
 * Que un porcentaje no supere 100 se chequea en el servicio, porque depende
 * del tipo.
 */
export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'El código solo puede tener letras, números, guiones y guiones bajos' })
  code: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  discount: number;

  @ApiProperty({ enum: TIPOS_CUPON })
  @IsIn(TIPOS_CUPON)
  type: (typeof TIPOS_CUPON)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(vacioANull)
  @IsNumber()
  @Min(0)
  minAmount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(vacioANull)
  @IsInt()
  @Min(1)
  maxUses?: number | null;

  /** Tope del descuento en pesos. Pensado para cupones de porcentaje. */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(vacioANull)
  @IsNumber()
  @Min(1)
  maxDiscount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /** Nombre viejo de `active`, que el backoffice todavía puede mandar. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(vacioANull)
  @IsDateString()
  expiresAt?: string | null;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
