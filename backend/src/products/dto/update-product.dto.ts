// DTO para actualizar producto — todos los campos son opcionales
// Extiende CreateProductDto con PartialType de Swagger para generar docs correctamente

import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
