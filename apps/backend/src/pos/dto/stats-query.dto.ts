import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentMethod, SalesChannel } from '@prisma/client';

export class PosStatsQueryDto {
  @IsDateString() from: string;
  @IsDateString() to: string;
  @IsOptional() @IsEnum(SalesChannel) channel?: SalesChannel;
  @IsOptional() @IsString() branchId?: string;
  @IsOptional() @IsString() sellerId?: string;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
}

export class PosSearchQueryDto {
  @IsOptional() @IsString() @MaxLength(120) search?: string;
}
