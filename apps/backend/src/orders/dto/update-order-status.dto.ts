import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

/**
 * Cambio de estado de un pedido desde el backoffice. El seguimiento viaja en
 * un mail al cliente: el link tiene que ser una dirección web (nada de
 * javascript:) y los largos están acotados.
 */
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Estado inválido' })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  trackingNumber?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'El link de seguimiento tiene que empezar con http:// o https://' })
  @MaxLength(300)
  trackingUrl?: string;
}
