import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod, SaleReturnType } from '@prisma/client';

export class ReturnItemDto {
  @IsString() orderItemId: string;
  @Type(() => Number) @IsNumber() @Min(1) quantity: number;
  @IsOptional() @IsBoolean() restock?: boolean;
}

export class CreateReturnDto {
  @IsEnum(SaleReturnType) type: SaleReturnType;
  @IsString() @MaxLength(500) reason: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReturnItemDto) items: ReturnItemDto[];
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) refundAmount?: number;
  @IsOptional() @IsEnum(PaymentMethod) refundMethod?: PaymentMethod;
  @IsOptional() @IsString() cashSessionId?: string;
  @IsOptional() @IsString() @MaxLength(160) reference?: string;
}

export class CancelSaleDto {
  @IsString() @MaxLength(500) reason: string;
  @IsOptional() @IsString() cashSessionId?: string;
}
