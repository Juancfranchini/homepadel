import { IsString, IsOptional, IsUrl, IsInt, Min, IsBoolean, ValidateIf } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @ValidateIf((o) => o.url !== '' && o.url !== null && o.url !== undefined)
  @IsUrl({}, { message: 'url debe ser una URL valida' })
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
