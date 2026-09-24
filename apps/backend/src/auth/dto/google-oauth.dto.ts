import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleStartDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  returnTo?: string;
}

export class GoogleCallbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  error?: string;
}
