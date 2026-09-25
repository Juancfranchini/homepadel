import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBranchDto {
  @IsString() @MinLength(2) @MaxLength(100) name: string;
  @IsString() @MinLength(2) @MaxLength(30) code: string;
  @IsOptional() @IsString() @MaxLength(240) address?: string;
}

export class CreateCashRegisterDto {
  @IsString() branchId: string;
  @IsString() @MinLength(2) @MaxLength(100) name: string;
  @IsString() @MinLength(2) @MaxLength(30) code: string;
}
