# Punto de Venta

El módulo de Punto de Venta (PDV) extiende el ecommerce existente. Una venta presencial o por redes sigue siendo un `Order`, usa los mismos `Product`/`ProductVariant`, el mismo inventario y aparece en el listado general de pedidos. `Payment`, `InventoryMovement`, `CashSession` y `AuditLog` agregan la trazabilidad que no existía sin crear un libro de ventas separado.

## Decisiones de integración

- `Order.channel` identifica tienda online, local, WhatsApp, Instagram, otras redes o teléfono. `branchId` y `sellerId` permiten atribuirla.
- Venta, cobro y caja son hechos distintos. `soldAt` fija la fecha comercial; cada `Payment.receivedAt` fija la fecha del ingreso; sólo el efectivo genera un movimiento físico de caja.
- Un cobro manual sólo admite efectivo, transferencia, tarjeta, billetera o terminal externa. Mercado Pago se confirma exclusivamente mediante su API/webhook.
- El precio se resuelve siempre en el servidor. El descuento, el envío y hasta dos cobros se validan antes de escribir.
- Las bajas y restituciones de stock son operaciones atómicas y dejan movimientos compensatorios. Cancelaciones y devoluciones conservan la venta original y agregan auditoría.
- La migración crea una sucursal y caja principal para que una instalación existente pueda operar inmediatamente. `/configuracion-pdv` permite agregar sucursales y cajas con `pos.settings`.

## Funciones operativas

### Venta

La ruta `/punto-de-venta` del backoffice ofrece búsqueda por nombre, SKU o código de barras, cámara cuando el navegador implementa `BarcodeDetector`, variantes, cantidades y stock. Permite seleccionar o cargar cliente, canal, descuento, envío, notas, hasta dos medios de cobro, venta pendiente, carritos guardados y alta de producto según permisos.

Para WhatsApp, Instagram, redes o teléfono puede generar un enlace público `/venta/:token`. El cliente completa entrega y pago en el checkout existente. El token queda ligado a una única orden y pasa por `OPEN`, `CHECKOUT` y `CONVERTED`, evitando duplicar venta e ingreso. Si Mercado Pago no puede crear la preferencia, el enlace vuelve a quedar disponible.

### Stock

- **PDV/local:** se verifica y descuenta dentro de la misma transacción que crea la venta, incluso si el cobro queda pendiente. Dos operaciones simultáneas no pueden vender la última unidad porque el `UPDATE` exige `stock >= quantity`.
- **Checkout online con Mercado Pago o enlace social:** la orden pendiente no reserva stock. Al aprobarse el pago se vuelve a verificar y se descuenta. Si el dinero ya fue aprobado pero el stock dejó de existir, la venta se conserva pagada con `stockIncident: true` e `inventoryStatus: NONE` para resolución manual; nunca se pierde un cobro real.
- **Transferencia online:** el pedido descuenta stock al registrarse porque la operación ya queda comprometida aunque el pago esté pendiente.
- **Cancelación/devolución:** repone únicamente las unidades indicadas que no sean por encargo y registra un `InventoryMovement` de devolución o cancelación. No se borra la historia.

Todos los movimientos registran fecha, producto, variante, cantidad con signo, venta, sucursal, motivo y usuario.

### Cobros y caja

`/caja` permite abrir una caja, registrar ingresos/retiros y cerrarla informando lo contado por medio. El resumen esperado se reconstruye con apertura, cobros, reintegros y movimientos manuales. El cierre conserva esperado, contado, diferencias, responsables y ventas vinculadas.

Una venta pendiente forma parte de ventas pero no de ingresos cobrados. Un pago online, transferencia, tarjeta o billetera se atribuye a su medio y no incrementa el efectivo físico. Sólo `PaymentMethod.CASH` exige una caja abierta y genera `CashMovement`.

### Posventa y envíos

El listado `/pedidos` reúne todos los canales, sucursal, vendedor, cobros y devoluciones. El detalle permite registrar un cobro pendiente, cancelar, devolver o cambiar, imprimir ticket común o de cambio y usar los estados existentes de empaquetado/despacho/entrega con seguimiento. Las etiquetas logísticas no se generan sin una API de transporte compatible.

### Estadísticas

`/estadisticas-ventas` filtra por período, canal, sucursal, vendedor y medio de pago, muestra totales, desglose por canal y medio, operaciones, unidades, ticket promedio, devoluciones, evolución y productos principales, y exporta CSV.

- **Ventas:** fecha `soldAt`, importe total después de descuentos e incluyendo envío; excluye canceladas y expone bruto, devoluciones y neto.
- **Ingresos:** fecha `Payment.receivedAt`, sólo pagos confirmados menos reintegros.
- **Ticket promedio:** venta bruta / operaciones no canceladas.
- **Consistencia:** el total general y los canales se calculan sobre la misma colección filtrada, por lo que el general coincide con la suma de sus canales.

## Permisos

Los administradores omiten el control granular. Desde `/equipo-pdv` pueden promover una cuenta existente al rol `STAFF` y asignarle permisos; la misma operación está disponible en `PATCH /api/users/:id/access`:

| Permiso | Alcance |
|---|---|
| `pos.sell` | vender, buscar clientes/productos, guardar carritos y registrar cobros |
| `pos.discount` | aplicar descuentos |
| `pos.create_product` | crear productos durante la venta |
| `pos.returns` | cancelar, cambiar o devolver |
| `pos.cash` | operar y cerrar caja |
| `pos.stats` | consultar/exportar estadísticas |
| `pos.settings` | crear sucursales y cajas desde la configuración del PDV |

Creación, cobros posteriores, cancelaciones, devoluciones y cierres dejan creador/modificador o entradas de `AuditLog`.

## Servicios externos

- Mercado Pago requiere `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `FRONTEND_URL` y `BACKEND_URL` correctamente configurados. Los reintegros se procesan primero en Mercado Pago y luego se registran en la posventa con la referencia que devuelve la pasarela.
- El escáner por cámara requiere HTTPS, permiso del usuario y soporte del navegador para `BarcodeDetector`; un lector USB funciona como teclado en el buscador.
- Impresión usa el diálogo del navegador.
- Correo Argentino conserva los datos de envío, pero emitir una etiqueta requiere credenciales y una integración de etiquetas que el proyecto todavía no posee.

## Verificación de aceptación

1. Abrir caja, vender una unidad local y comprobar: baja el stock del producto/variante, aparece un movimiento `SALE`, la orden figura con canal `LOCAL` y suma al general/local.
2. Completar una compra web y aprobar Mercado Pago: la orden figura una sola vez con canal `ONLINE`, el pago es `MERCADOPAGO` y no existe movimiento de efectivo en caja.
3. Generar un enlace de WhatsApp, abrirlo y pagar: el enlace queda `CONVERTED`, una sola orden referencia el token y el stock baja al confirmar el pago.
4. Registrar una venta sin cobros: ventas aumenta, ingresos no. Agregar luego un pago y verificar que ingresos aumenta por su fecha de cobro.
5. Devolver o cancelar: la orden y sus cobros originales permanecen, aparecen reintegro, movimiento compensatorio de stock y auditoría, y estadísticas/caja reflejan el signo correcto.
6. Cerrar caja: esperado, contado y diferencia por medio deben poder reconstruirse desde pagos y movimientos que muestra la sesión.

La migración se aplica con `npx prisma migrate deploy` desde `apps/backend`.
