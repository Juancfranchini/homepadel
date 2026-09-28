/**
 * El detalle de un pedido trae nombre, email, teléfono y domicilio del
 * comprador: solo puede verlo quien vende. Antes alcanzaba con cualquier
 * sesión de cliente, así que un cliente podía leer pedidos ajenos por id.
 */
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { OrdersController } from './orders.controller';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { PERMISSIONS_KEY } from '../common/decorators/permissions.decorator';
import { POS_PERMISSIONS } from '../common/permissions';

describe('OrdersController — permisos', () => {
  it('el detalle de un pedido exige permiso de venta', () => {
    const handler = OrdersController.prototype.findOne;
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toContain(PermissionsGuard);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, handler)).toContain(POS_PERMISSIONS.SELL);
  });
});
