// Decorador @Roles — define qué roles pueden acceder a una ruta
// Uso: @Roles(Role.ADMIN) o @Roles(Role.ADMIN, Role.CUSTOMER)
// Debe usarse junto con RolesGuard

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
