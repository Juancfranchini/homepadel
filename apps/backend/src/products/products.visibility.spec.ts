/**
 * Un producto dado de baja no se ve en la tienda: ni por su dirección ni
 * pidiendo `showAll=1`. Antes las dos cosas funcionaban para cualquiera, y
 * el producto de prueba de $500 seguía abriendo aunque estuviera inactivo.
 */

import { Role } from '@prisma/client';
import { ProductsController } from './products.controller';

function controlador() {
  const service = { findBySlug: jest.fn().mockResolvedValue({}), findAll: jest.fn().mockResolvedValue({}) };
  return { service, controller: new ProductsController(service as never) };
}

describe('visibilidad de productos inactivos', () => {
  it('la ficha pública solo busca productos activos', async () => {
    const { service, controller } = controlador();
    await controller.findOne('conjunto-deportivo', {});
    expect(service.findBySlug).toHaveBeenCalledWith('conjunto-deportivo', { incluirInactivos: false });
  });

  it('un cliente con sesión tampoco ve los inactivos', async () => {
    const { service, controller } = controlador();
    await controller.findOne('conjunto-deportivo', { user: { role: Role.CUSTOMER } });
    expect(service.findBySlug).toHaveBeenCalledWith('conjunto-deportivo', { incluirInactivos: false });
  });

  it('el personal los ve, para poder editarlos y reactivarlos', async () => {
    const { service, controller } = controlador();
    await controller.findOne('id-1', { user: { role: Role.ADMIN } });
    await controller.findOne('id-1', { user: { role: Role.STAFF } });
    expect(service.findBySlug).toHaveBeenNthCalledWith(1, 'id-1', { incluirInactivos: true });
    expect(service.findBySlug).toHaveBeenNthCalledWith(2, 'id-1', { incluirInactivos: true });
  });

  it('showAll=1 se ignora si no lo pide el personal', async () => {
    const { service, controller } = controlador();
    await controller.findAll({ showAll: '1', limit: '50' }, {});
    await controller.findAll({ showAll: '1' }, { user: { role: Role.ADMIN } });
    expect(service.findAll).toHaveBeenNthCalledWith(1, { showAll: undefined, limit: '50' });
    expect(service.findAll).toHaveBeenNthCalledWith(2, { showAll: '1' });
  });
});
