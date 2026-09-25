import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { DiscountType, PaymentMethod, SalesChannel } from '@prisma/client';

export class PosSaleItemDto {
  @IsString() productId: string;
  @IsOptional() @IsString() variantId?: string;
  @Type(() => Number) @IsNumber() @Min(1) quantity: number;
}

export class PosCustomerDto {
  @IsString() @MaxLength(120) name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(240) address?: string;
}

export class PosPaymentDto {
  @IsEnum(PaymentMethod) method: PaymentMethod;
  @Type(() => Number) @IsNumber() @Min(0.01) amount: number;
  @IsOptional() @IsString() @MaxLength(160) reference?: string;
}

export class CreatePosSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosSaleItemDto)
  items: PosSaleItemDto[];

  @IsOptional() @IsString() customerId?: string;
  @IsOptional() @ValidateNested() @Type(() => PosCustomerDto) customer?: PosCustomerDto;
  @IsEnum(SalesChannel) channel: SalesChannel;
  @IsString() branchId: string;
  @IsOptional() @IsString() cashSessionId?: string;
  @IsOptional() @IsEnum(DiscountType) discountType?: DiscountType;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100000000) discountValue?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) shipping?: number;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @IsOptional() @IsString() @MaxLength(120) source?: string;
  @IsOptional() @IsString() savedCartId?: string;

  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => PosPaymentDto)
  payments: PosPaymentDto[];
}

export class RegisterPosPaymentDto {
  @IsOptional() @IsString() cashSessionId?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => PosPaymentDto)
  payments: PosPaymentDto[];
}
