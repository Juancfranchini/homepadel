/**
 * Textos de los mails que recibe quien compra. Solo armado de HTML: el envío
 * lo hace EmailService. Todo lo que escribe un cliente o la tienda (nombre,
 * seguimiento, productos) pasa por `esc`: va a un HTML que abre el mail de
 * otra persona.
 */

export interface ItemMail {
  name: string;
  quantity: number;
  price: number;
}

export interface DatosBancarios {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  banco: string | null;
}

export interface PedidoMail {
  orderNumber: string;
  customerName: string;
  items: ItemMail[];
  total: number;
}

export interface MailArmado {
  subject: string;
  html: string;
}

const VERDE = '#C8FF00';
const TEXTO = '#C7C7C0';

export function esc(valor: unknown): string {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c] || c);
}

export function pesos(monto: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(monto);
}

/** Link de WhatsApp (solo dígitos, con 549 si falta el código de país). Null si no hay un número usable. */
export function enlaceWhatsapp(telefono?: string | null): string | null {
  const digitos = (telefono || '').replace(/\D/g, '');
  if (digitos.length < 8) return null;
  return 'https://wa.me/' + (digitos.startsWith('54') ? digitos : '549' + digitos.replace(/^0+/, ''));
}

function filas(items: ItemMail[]): string {
  return items
    .map((i) => '<tr><td style="padding:8px;border-bottom:1px solid #2a3033;">' + esc(i.name) + ' × ' + i.quantity +
      '</td><td style="padding:8px;border-bottom:1px solid #2a3033;text-align:right;">' + pesos(i.price * i.quantity) + '</td></tr>')
    .join('');
}

function marco(titulo: string, cuerpo: string): string {
  return '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background-color:#0C0C0C;color:#F7F6F7;padding:20px;">' +
    '<div style="max-width:600px;margin:0 auto;background-color:#1A1F21;border-radius:8px;padding:30px;">' +
    '<h1 style="color:' + VERDE + ';text-align:center;font-size:22px;">' + esc(titulo) + '</h1>' + cuerpo +
    '<p style="color:#8A8A85;font-size:12px;text-align:center;margin-top:24px;">Home Pádel</p>' +
    '</div></body></html>';
}

function resumen(p: PedidoMail): string {
  return '<table style="width:100%;border-collapse:collapse;margin:20px 0;color:#F7F6F7;">' + filas(p.items) + '</table>' +
    '<p style="text-align:right;color:' + VERDE + ';font-size:16px;"><strong>Total: ' + pesos(p.total) + '</strong></p>';
}

const parrafo = (texto: string) => '<p style="color:' + TEXTO + ';line-height:1.5;">' + texto + '</p>';

/** Pagó con Mercado Pago, o la tienda confirmó su transferencia. */
export function mailPagoRecibido(p: PedidoMail & { esRetiro: boolean }): MailArmado {
  const siguiente = p.esRetiro
    ? 'Elegiste retirar en el local.'
    : 'Cuando lo despachemos te mandamos el número de seguimiento por este mismo medio.';
  const cuerpo =
    parrafo('Hola ' + esc(p.customerName) + ', recibimos tu pago del pedido <strong style="color:' + VERDE + ';">' + esc(p.orderNumber) + '</strong>. Ya lo estamos preparando.') +
    resumen(p) + parrafo(siguiente);
  return { subject: 'Recibimos tu pago — pedido ' + p.orderNumber, html: marco('¡Gracias por tu compra!', cuerpo) };
}

/** Eligió transferencia: cómo pagar y que tiene que mandar el comprobante por WhatsApp. */
export function mailTransferencia(p: PedidoMail & { datos: DatosBancarios | null; whatsapp: string | null }): MailArmado {
  const datos = p.datos;
  const lineas = datos
    ? ([['Titular', datos.titular], ['Banco', datos.banco], ['Alias', datos.alias], ['CBU', datos.cbu]] as [string, string | null][])
        .filter(([, valor]) => valor)
        .map(([nombre, valor]) => '<p style="margin:4px 0;color:#F7F6F7;"><span style="color:#8A8A85;">' + nombre + ':</span> <strong>' + esc(valor) + '</strong></p>')
        .join('')
    : '';
  const cuenta = lineas
    ? '<div style="background-color:#0C0C0C;padding:15px;border-radius:5px;margin:20px 0;"><p style="margin:0 0 8px;color:' + VERDE + ';"><strong>Transferí ' + pesos(p.total) + ' a:</strong></p>' + lineas + '</div>'
    : '';
  const enlace = enlaceWhatsapp(p.whatsapp);
  const comprobante = enlace
    ? parrafo('<strong>Importante:</strong> enviá el comprobante de la transferencia por WhatsApp a <a href="' + esc(enlace) + '" style="color:' + VERDE + ';">' + esc(p.whatsapp) + '</a>, indicando tu número de pedido. Apenas confirmemos el pago te avisamos por mail.')
    : parrafo('<strong>Importante:</strong> enviá el comprobante de la transferencia por WhatsApp, indicando tu número de pedido. Apenas confirmemos el pago te avisamos por mail.');
  const cuerpo =
    parrafo('Hola ' + esc(p.customerName) + ', recibimos tu pedido <strong style="color:' + VERDE + ';">' + esc(p.orderNumber) + '</strong>. Para confirmarlo falta tu transferencia.') +
    resumen(p) + cuenta + comprobante;
  return { subject: 'Pedido ' + p.orderNumber + ': cómo pagar por transferencia', html: marco('Tu pedido está pendiente de pago', cuerpo) };
}

/** Despachado: con el seguimiento si la tienda lo cargó. */
export function mailDespachado(p: { orderNumber: string; customerName: string; trackingNumber?: string | null; trackingUrl?: string | null }): MailArmado {
  const numero = p.trackingNumber?.trim();
  const url = p.trackingUrl && /^https?:\/\//i.test(p.trackingUrl) ? p.trackingUrl : null;
  const seguimiento = numero || url
    ? '<div style="background-color:#0C0C0C;padding:15px;border-radius:5px;margin:20px 0;">' +
      (numero ? '<p style="margin:4px 0;color:' + TEXTO + ';">Número de seguimiento: <strong style="color:' + VERDE + ';">' + esc(numero) + '</strong></p>' : '') +
      (url ? '<p style="margin:4px 0;color:' + TEXTO + ';">Podés seguir tu envío <a href="' + esc(url) + '" style="color:' + VERDE + ';">acá</a>.</p>' : '') +
      '</div>'
    : '';
  const cuerpo = parrafo('Hola ' + esc(p.customerName) + ', tu pedido <strong style="color:' + VERDE + ';">' + esc(p.orderNumber) + '</strong> está en camino.') + seguimiento;
  return { subject: 'Tu pedido ' + p.orderNumber + ' fue despachado', html: marco('¡Tu pedido fue despachado!', cuerpo) };
}
