import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CashMovementType } from '@prisma/client';

export class OpenCashSessionDto {
  @IsString() registerId: string;
  @Type(() => Number) @IsNumber() @Min(0) openingAmount: number;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

export class CashEntryDto {
  @IsString() cashSessionId: string;
  @IsEnum(CashMovementType) type: CashMovementType;
  @Type(() => Number) @IsNumber() @Min(0.01) amount: number;
  @IsString() @MaxLength(500) note: string;
}

export class CloseCashSessionDto {
  @IsObject()
  countedTotals: Record<string, number>;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
