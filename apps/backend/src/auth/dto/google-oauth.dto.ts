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

  // Google agrega estos parámetros estándar a la URL de vuelta —no son algo
  // que nosotros pedimos, los manda siempre—. El ValidationPipe global tiene
  // `forbidNonWhitelisted: true`, así que sin declararlos acá rechazaba la
  // petición entera con 400 antes de que el controller la viera, y el login
  // con Google no funcionaba nunca. Se aceptan y se ignoran: el código solo
  // usa `code`, `state` y `error`.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iss?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  scope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  authuser?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  prompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hd?: string;
}
