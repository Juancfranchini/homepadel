// Guard de autenticación JWT OPCIONAL
// A diferencia de JwtAuthGuard, no rechaza requests sin token: simplemente deja
// req.user en undefined. Sirve para endpoints públicos que devuelven más
// información cuando quien consulta es un administrador autenticado.

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Passport llama a este método con el resultado de la validación.
  // Al no lanzar excepción cuando no hay usuario, la request sigue su curso.
  handleRequest(_err: any, user: any) {
    return user || undefined;
  }
}
