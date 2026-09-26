/**
 * Precio y stock — el punto donde el checkout puede costar plata si se rompe.
 *
 * Lo que estas pruebas protegen:
 *  · que el precio salga SIEMPRE de la base y nunca del navegador;
 *  · que no se pueda comprar más de lo que hay;
 *  · que el descuento de stock vaya a la variante correcta cuando el producto
 *    tiene talles.
 *
 * Se usa un Prisma simulado a propósito: no hace falta base de datos para
 * verificar estas reglas, y así las pruebas corren en cualquier máquina.
 */

import { ConflictException, NotFoundException } from '@nestjs/common';
import { PricingService } from './pricing.service';

// ─── Catálogo de prueba ──────────────────────────────────────────────────────

const PALETA = {
  name: 'Paleta Nox AT10',
  price: 500000,
  salePrice: null,
  stock: 2,
  active: true,
  variants: [] as any[],
};

const EN_OFERTA = {
  name: 'Paleta en oferta',
  price: 300000,
  salePrice: 240000,
  stock: 5,
  active: true,
  variants: [] as any[],
};

const OFERTA_INVALIDA = {
  // salePrice mayor al precio de lista: no es una oferta real, se ignora
  name: 'Oferta mal cargada',
  price: 100000,
  salePrice: 150000,
  stock: 5,
  active: true,
  variants: [] as any[],
};

const DESCONTINUADA = {
  name: 'Descontinuada',
  price: 100000,
  salePrice: null,
  stock: 9,
  active: false,
  variants: [] as any[],
};

/**
 * Cada producto tiene una variante "base" persistida que no se ofrece: no
 * tiene talle ni color y no aparece en ningún selector. Al contarla como si
 * fuera elegible, el checkout rechazaba el pedido pidiendo elegir una
 * variante inexistente, y ningún producto agregado desde el catálogo se podía
 * comprar.
 */
const ZAPATILLAS = {
  name: 'Zapatillas Bullpadel Vertex 23',
  price: 10,
  salePrice: null,
  stock: 1,
  active: true,
  variants: [{ id: 'zap-base', stock: 1, active: true, isDefault: true }],
};

const REMERA = {
  name: 'Remera Home Pádel',
  price: 45000,
  salePrice: null,
  stock: 0, // el stock real vive en cada variante
  active: true,
  variants: [{ id: 'var-m', stock: 3, active: true }],
};

const CATALOGO: Record<string, any> = {
  'pal-1': PALETA,
  'pal-2': EN_OFERTA,
  'pal-3': DESCONTINUADA,
  'pal-4': OFERTA_INVALIDA,
  'rem-1': REMERA,
  'zap-1': ZAPATILLAS,
};

/**
 * Prisma simulado. `findUnique` respeta el filtro de variantes que hace el
 * servicio, para que el caso "la variante no pertenece al producto" se comporte
 * como en la base real.
 */
function fakePrisma(catalogo = CATALOGO) {
  return {
    product: {
      findUnique: jest.fn(async ({ where, select }: any) => {
        const producto = catalogo[where.id];
        if (!producto) return null;

        const filtroVariante = select?.variants?.where;
        // Se respeta el filtro tal como lo manda el servicio, incluido el
        // que descarta las variantes base: si no, la prueba no distingue
        // entre pedir todas las variantes y pedir solo las elegibles.
        const variants = filtroVariante?.id
          ? producto.variants.filter((v: any) => v.id === filtroVariante.id)
          : producto.variants.filter(
              (v: any) =>
                (filtroVariante?.active === undefined || v.active === filtroVariante.active) &&
                (filtroVariante?.isDefault === undefined || !!v.isDefault === filtroVariante.isDefault),
            );

        return { ...producto, variants };
      }),
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
    productVariant: {
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
    $transaction: jest.fn(async (fn: any) =>
      fn({
        product: { updateMany: jest.fn(async () => ({ count: 1 })) },
        productVariant: { updateMany: jest.fn(async () => ({ count: 1 })) },
      }),
    ),
  } as any;
}

// ─── Precio ──────────────────────────────────────────────────────────────────

describe('PricingService — el precio sale de la base, no del navegador', () => {
  it('ignora el precio que envía el cliente', async () => {
    const service = new PricingService(fakePrisma());

    // Un atacante edita la petición y dice que la paleta sale $1
    const [item] = await service.resolveItems([
      { productId: 'pal-1', quantity: 1, price: 1 } as any,
    ]);

    expect(item.price).toBe(500000);
  });

  it('cobra el precio promocional cuando es válido', async () => {
    const service = new PricingService(fakePrisma());
    const [item] = await service.resolveItems([{ productId: 'pal-2', quantity: 1 }]);
    expect(item.price).toBe(240000);
  });

  it('ignora un precio promocional mayor al de lista', async () => {
    const service = new PricingService(fakePrisma());
    const [item] = await service.resolveItems([{ productId: 'pal-4', quantity: 1 }]);
    expect(item.price).toBe(100000);
  });

  it('devuelve el nombre guardado en la base, no el que llegó en la petición', async () => {
    const service = new PricingService(fakePrisma());
    const [item] = await service.resolveItems([
      { productId: 'pal-1', quantity: 1, name: 'Nombre falso' } as any,
    ]);
    expect(item.name).toBe('Paleta Nox AT10');
  });
});

// ─── Disponibilidad ──────────────────────────────────────────────────────────

describe('PricingService — no se puede comprar lo que no hay', () => {
  const casos: Array<[string, any, any]> = [
    ['más unidades que el stock', { productId: 'pal-1', quantity: 5 }, ConflictException],
    ['producto inexistente', { productId: 'no-existe', quantity: 1 }, NotFoundException],
    ['producto desactivado', { productId: 'pal-3', quantity: 1 }, ConflictException],
    ['cantidad cero', { productId: 'pal-1', quantity: 0 }, ConflictException],
    ['cantidad negativa', { productId: 'pal-1', quantity: -3 }, ConflictException],
    ['cantidad fraccionada', { productId: 'pal-1', quantity: 1.5 }, ConflictException],
  ];

  it.each(casos)('rechaza %s', async (_titulo, item, error) => {
    const service = new PricingService(fakePrisma());
    await expect(service.resolveItems([item])).rejects.toBeInstanceOf(error);
  });

  it('rechaza un pedido sin productos', async () => {
    const service = new PricingService(fakePrisma());
    await expect(service.resolveItems([])).rejects.toBeInstanceOf(ConflictException);
  });

  it('acepta justo el stock disponible', async () => {
    const service = new PricingService(fakePrisma());
    const [item] = await service.resolveItems([{ productId: 'pal-1', quantity: 2 }]);
    expect(item.quantity).toBe(2);
  });
});

// ─── Variantes ───────────────────────────────────────────────────────────────

describe('PricingService — productos con talles', () => {
  it('exige elegir variante si el producto tiene', async () => {
    const service = new PricingService(fakePrisma());
    await expect(
      service.resolveItems([{ productId: 'rem-1', quantity: 1 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deja comprar un producto cuya única variante es la base, sin elegir nada', async () => {
    // El caso que rompía el checkout: unas zapatillas sin talles, agregadas
    // desde el catálogo, se rechazaban con "Debes seleccionar una variante"
    // porque se contaba la variante base, que no se ofrece en ningún lado.
    const service = new PricingService(fakePrisma());
    const [item] = await service.resolveItems([{ productId: 'zap-1', quantity: 1 }]);

    expect(item.name).toBe('Zapatillas Bullpadel Vertex 23');
    expect(item.price).toBe(10);
    expect(item.variantId).toBeUndefined();
  });

  it('sigue tomando el stock del producto cuando solo hay variante base', async () => {
    const service = new PricingService(fakePrisma());
    await expect(
      service.resolveItems([{ productId: 'zap-1', quantity: 2 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza una variante que no pertenece al producto', async () => {
    const service = new PricingService(fakePrisma());
    await expect(
      service.resolveItems([{ productId: 'rem-1', variantId: 'var-ajena', quantity: 1 }]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('valida el stock de la variante, no el del producto', async () => {
    // La remera tiene stock 0 a nivel producto y 3 en la variante:
    // debe mirar el de la variante.
    const service = new PricingService(fakePrisma());
    const [item] = await service.resolveItems([
      { productId: 'rem-1', variantId: 'var-m', quantity: 3 },
    ]);
    expect(item.quantity).toBe(3);

    await expect(
      service.resolveItems([{ productId: 'rem-1', variantId: 'var-m', quantity: 4 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza una variante desactivada', async () => {
    const catalogo = {
      ...CATALOGO,
      'rem-1': { ...REMERA, variants: [{ id: 'var-m', stock: 3, active: false }] },
    };
    const service = new PricingService(fakePrisma(catalogo));
    await expect(
      service.resolveItems([{ productId: 'rem-1', variantId: 'var-m', quantity: 1 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

// ─── Descuento de stock ──────────────────────────────────────────────────────

describe('PricingService — descuento de stock', () => {
  it('descuenta de la variante cuando el ítem la tiene', async () => {
    const prisma = fakePrisma();
    const variantUpdate = jest.fn(async () => ({ count: 1 }));
    const productUpdate = jest.fn(async () => ({ count: 1 }));
    prisma.$transaction = jest.fn(async (fn: any) =>
      fn({ product: { updateMany: productUpdate }, productVariant: { updateMany: variantUpdate } }),
    );

    const service = new PricingService(prisma);
    await service.decrementStock([
      { productId: 'rem-1', variantId: 'var-m', name: 'Remera', quantity: 2, price: 45000 },
    ]);

    expect(variantUpdate).toHaveBeenCalledTimes(1);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('descuenta del producto cuando no hay variante', async () => {
    const prisma = fakePrisma();
    const variantUpdate = jest.fn(async () => ({ count: 1 }));
    const productUpdate = jest.fn(async () => ({ count: 1 }));
    prisma.$transaction = jest.fn(async (fn: any) =>
      fn({ product: { updateMany: productUpdate }, productVariant: { updateMany: variantUpdate } }),
    );

    const service = new PricingService(prisma);
    await service.decrementStock([
      { productId: 'pal-1', name: 'Paleta', quantity: 1, price: 500000 },
    ]);

    expect(productUpdate).toHaveBeenCalledTimes(1);
    expect(variantUpdate).not.toHaveBeenCalled();
  });

  it('lleva la condición de stock dentro del UPDATE, no en una lectura previa', async () => {
    // Esto es lo que evita que dos compras simultáneas de la última unidad
    // prosperen las dos. Si alguien reemplaza el filtro por un findUnique
    // seguido de un update, esta prueba lo detecta.
    const prisma = fakePrisma();
    let filtroUsado: any = null;
    prisma.$transaction = jest.fn(async (fn: any) =>
      fn({
        product: {
          updateMany: jest.fn(async (args: any) => {
            filtroUsado = args.where;
            return { count: 1 };
          }),
        },
        productVariant: { updateMany: jest.fn(async () => ({ count: 1 })) },
      }),
    );

    const service = new PricingService(prisma);
    await service.decrementStock([
      { productId: 'pal-1', name: 'Paleta', quantity: 2, price: 500000 },
    ]);

    expect(filtroUsado.stock).toEqual({ gte: 2 });
    expect(filtroUsado.active).toBe(true);
  });

  it('falla si otra compra se llevó el stock en el medio', async () => {
    const prisma = fakePrisma();
    prisma.$transaction = jest.fn(async (fn: any) =>
      fn({
        // count 0 = ninguna fila cumplía la condición de stock
        product: { updateMany: jest.fn(async () => ({ count: 0 })) },
        productVariant: { updateMany: jest.fn(async () => ({ count: 0 })) },
      }),
    );

    const service = new PricingService(prisma);
    await expect(
      service.decrementStock([{ productId: 'pal-1', name: 'Paleta', quantity: 1, price: 500000 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

// ─── Costo de envío (P1) ───────────────────────────────────────────────────

describe('PricingService — el envío sale de la tarifa configurada, no del navegador', () => {
  function fakePrismaConShippingConfig(data: any) {
    return {
      siteSection: {
        findUnique: jest.fn(async () => (data === undefined ? null : { key: 'shipping_rates', data })),
      },
    } as any;
  }

  it('cobra la tarifa fija cuando el subtotal no llega al umbral', async () => {
    const service = new PricingService(
      fakePrismaConShippingConfig({ flatRate: 4500, freeShippingThreshold: 100000 }),
    );
    expect(await service.calculateShipping(50000)).toBe(4500);
  });

  it('es gratis exactamente en el umbral, no solo por encima', async () => {
    const service = new PricingService(
      fakePrismaConShippingConfig({ flatRate: 4500, freeShippingThreshold: 100000 }),
    );
    expect(await service.calculateShipping(100000)).toBe(0);
  });

  it('usa valores por defecto si nunca se configuró nada', async () => {
    const service = new PricingService(fakePrismaConShippingConfig(undefined));
    expect(await service.calculateShipping(1000)).toBe(4500);
    expect(await service.calculateShipping(200000)).toBe(0);
  });

  it('respeta una tarifa distinta a la default', async () => {
    const service = new PricingService(
      fakePrismaConShippingConfig({ flatRate: 9999, freeShippingThreshold: 50000 }),
    );
    expect(await service.calculateShipping(1000)).toBe(9999);
    expect(await service.calculateShipping(50000)).toBe(0);
  });

  it('retiro en el local es gratis aunque el subtotal no llegue al umbral', async () => {
    const service = new PricingService(
      fakePrismaConShippingConfig({ flatRate: 4500, freeShippingThreshold: 100000 }),
    );
    expect(await service.calculateShipping(1000, 'retiro_local')).toBe(0);
  });

  it('retiro en el local no depende de que exista configuración de envíos', async () => {
    const service = new PricingService(fakePrismaConShippingConfig(undefined));
    expect(await service.calculateShipping(1000, 'retiro_local')).toBe(0);
  });
});

/**
 * Productos por encargo.
 *
 * No se tienen: se piden al proveedor cuando alguien los reserva, así que su
 * stock es cero y eso es lo normal. Al validarlos igual que al resto, la ficha
 * los mostraba como agotados y el backend rechazaba toda reserva.
 */
describe('PricingService — productos por encargo', () => {
  const POR_ENCARGO = {
    name: 'Zapatillas por encargo',
    price: 120000,
    salePrice: null,
    stock: 0,
    active: true,
    isMadeToOrder: true,
    variants: [] as any[],
  };

  const catalogo = { 'enc-1': POR_ENCARGO, ...CATALOGO };

  it('deja reservar aunque no haya stock', async () => {
    const service = new PricingService(fakePrisma(catalogo));
    const [item] = await service.resolveItems([{ productId: 'enc-1', quantity: 2 }]);

    expect(item.quantity).toBe(2);
    expect(item.isMadeToOrder).toBe(true);
  });

  it('no intenta descontar stock de un encargo', async () => {
    const prisma = fakePrisma(catalogo);
    const service = new PricingService(prisma);

    await service.decrementStock([
      { productId: 'enc-1', name: 'Zapatillas por encargo', quantity: 2, price: 120000, isMadeToOrder: true },
    ]);

    expect(prisma.product.updateMany).not.toHaveBeenCalled();
  });

  it('sigue controlando el stock de los productos normales', async () => {
    const service = new PricingService(fakePrisma(catalogo));
    await expect(
      service.resolveItems([{ productId: 'pal-1', quantity: 99 }]),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
