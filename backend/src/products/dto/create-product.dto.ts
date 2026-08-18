import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Max, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()             @IsString()                          name: string;
  @ApiPropertyOptional()    @IsString()  @IsOptional()           description?: string;
  @ApiProperty()             @IsNumber() @Min(0)                  price: number;
  @ApiPropertyOptional()    @IsNumber()  @IsOptional()            salePrice?: number;
  @ApiProperty()             @IsString()                          sku: string;
  @ApiProperty()             @IsNumber() @Min(0)                  stock: number;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() images?: string[];
  @ApiPropertyOptional()    @IsBoolean() @IsOptional()            featured?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional()            isNew?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional()            isOffer?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional()            active?: boolean;
  @ApiPropertyOptional()    @IsString()  @IsOptional()            categoryId?: string;
  @ApiPropertyOptional()    @IsString()  @IsOptional()            brandId?: string;
  @ApiPropertyOptional()    @IsString()  @IsOptional()            videoUrl?: string;
  @ApiPropertyOptional()                @IsOptional()             performanceStats?: unknown;
  @ApiPropertyOptional()                @IsOptional()             features?: unknown;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() relatedProductIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() highlights?: string[];
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() transferPrice?: number;
  @ApiPropertyOptional()                @IsOptional()             relatedVideos?: unknown;
  @ApiPropertyOptional()                @IsOptional()             specs?: unknown;
  @ApiPropertyOptional()                @IsOptional()             compareData?: unknown;
  @ApiPropertyOptional()    @IsString()  @IsOptional()            highlightsTitle?: string;
  @ApiPropertyOptional()    @IsString()  @IsOptional()            highlightsDescription?: string;
  @ApiPropertyOptional()    @IsNumber()  @Min(0) @Max(100) @IsOptional() discountPercentage?: number;
  @ApiPropertyOptional()    @IsNumber()  @Min(0) @Max(12) @IsOptional() installments?: number;
  @ApiPropertyOptional()    @IsNumber()  @Min(0) @IsOptional() installmentsInterest?: number;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional() hasInstallmentsInterest?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional() showVideo?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional() showPerformance?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional() showHighlights?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional() showCompare?: boolean;
  @ApiPropertyOptional()    @IsBoolean() @IsOptional() showRelated?: boolean;
}