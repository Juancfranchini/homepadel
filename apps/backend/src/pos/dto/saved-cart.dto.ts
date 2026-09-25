import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { DiscountType, SalesChannel } from '@prisma/client';
import { PosCustomerDto, PosSaleItemDto } from './pos-sale.dto';

export class SaveCartDto {
  @IsString() @MaxLength(120) name: string;
  @IsEnum(SalesChannel) channel: SalesChannel;
  @IsOptional() @IsString() branchId?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosSaleItemDto)
  items: PosSaleItemDto[];
  @IsOptional() @ValidateNested() @Type(() => PosCustomerDto) customer?: PosCustomerDto;
  @IsOptional() @IsEnum(DiscountType) discountType?: DiscountType;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) discountValue?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) shipping?: number;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class CreateSalesLinkDto {
  @IsEnum(SalesChannel) channel: SalesChannel;
  @IsOptional() @IsString() branchId?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosSaleItemDto)
  items: PosSaleItemDto[];
  @IsOptional() @ValidateNested() @Type(() => PosCustomerDto) customer?: PosCustomerDto;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}
