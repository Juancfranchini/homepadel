import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(1)
  productId: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;
}

export class UpdateReviewDto {
  @IsOptional() @IsString() @MinLength(1) productId?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) name?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(1000) comment?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsBoolean() verified?: boolean;
}
