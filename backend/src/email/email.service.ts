import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private prisma: PrismaService) {}

  private async getConfig() {
    const section = await this.prisma.siteSection.findUnique({
      where: { key: 'email_settings' },
    });
    return (section?.data as any) || null;
  }

  private async getTemplateByType(type: string) {
    return this.prisma.emailTemplate.findFirst({
      where: { type, active: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    let html = content;
    Object.entries(variables).forEach(([key, value]) => {
      html = html.replace(new RegExp('{{\\s*' + key + '\\s*}}', 'g'), value || '');
    });
    return html;
  }

  async sendEmail(to: string, subject: string, html: string) {
    const config = await this.getConfig();
    if (!config?.resendApiKey) {
      this.logger.warn('Resend API Key no configurada');
      return null;
    }

    try {
      const resend = new Resend(config.resendApiKey);
      const from = config.fromEmail || 'Home Padel <noreply@homepadel.com.ar>';
      const response = await resend.emails.send({ from, to, subject, html });
      this.logger.log('Email enviado a ' + to);
      return response;
    } catch (error) {
      this.logger.error('Error enviando email a ' + to, error);
      throw error;
    }
  }

  async sendTestEmail(to: string, templateId?: string) {
    let html: string;
    let subject: string;

    if (templateId) {
      const template = await this.prisma.emailTemplate.findUnique({ where: { id: templateId } });
      if (!template) throw new Error('Plantilla no encontrada');
      html = template.content;
      subject = template.subject;
    } else {
      html = '<div style="font-family: Arial, sans-serif; background-color: #0C0C0C; color: #F7F6F7; padding: 40px; text-align: center;"><h1 style="color: #C8FF00;">Home Padel</h1><p>Este es un email de prueba.</p></div>';
      subject = 'Email de prueba - Home Padel';
    }

    return this.sendEmail(to, subject, html);
  }

  async sendOrderConfirmation(to: string, orderNumber: string, customerName: string, items: any[], total: number) {
    const template = await this.getTemplateByType('order_confirmation');
    
    let html: string;
    let subject: string;

    if (template) {
      const itemsHtml = items.map(item =>
        '<tr><td style="padding: 8px; border-bottom: 1px solid #1A1F21;">' + item.name + ' x' + item.quantity + '</td><td style="padding: 8px; border-bottom: 1px solid #1A1F21; text-align: right;">$' + (item.price * item.quantity).toFixed(2) + '</td></tr>'
      ).join('');

      html = this.replaceVariables(template.content, {
        orderNumber,
        customerName,
        total: total.toFixed(2),
        items: itemsHtml,
      });
      subject = this.replaceVariables(template.subject, { orderNumber, customerName });
    } else {
      const itemsHtml = items.map(item =>
        '<tr><td style="padding: 8px; border-bottom: 1px solid #1A1F21;">' + item.name + ' x' + item.quantity + '</td><td style="padding: 8px; border-bottom: 1px solid #1A1F21; text-align: right;">$' + (item.price * item.quantity).toFixed(2) + '</td></tr>'
      ).join('');

      html = '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background-color: #0C0C0C; color: #F7F6F7; padding: 20px;">' +
        '<div style="max-width: 600px; margin: 0 auto; background-color: #1A1F21; border-radius: 8px; padding: 30px;">' +
        '<h1 style="color: #C8FF00; text-align: center;">¡Gracias por tu compra!</h1>' +
        '<p style="color: #C7C7C0;">Tu pedido <strong style="color: #C8FF00;">' + orderNumber + '</strong> ha sido confirmado.</p>' +
        '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">' + itemsHtml + '</table>' +
        '<p style="color: #C7C7C0; text-align: right;"><strong style="color: #C8FF00;">Total: $' + total.toFixed(2) + '</strong></p>' +
        '</div></body></html>';
      subject = 'Confirmacion de Pedido ' + orderNumber + ' - Home Padel';
    }

    return this.sendEmail(to, subject, html);
  }

  async sendOrderShipped(to: string, orderNumber: string, customerName: string, trackingNumber: string, trackingUrl?: string) {
    const template = await this.getTemplateByType('order_shipped');

    let html: string;
    let subject: string;

    if (template) {
      html = this.replaceVariables(template.content, {
        orderNumber,
        customerName,
        trackingNumber,
        trackingUrl: trackingUrl || '',
      });
      subject = this.replaceVariables(template.subject, { orderNumber, customerName, trackingNumber });
    } else {
      html = '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background-color: #0C0C0C; color: #F7F6F7; padding: 20px;">' +
        '<div style="max-width: 600px; margin: 0 auto; background-color: #1A1F21; border-radius: 8px; padding: 30px;">' +
        '<h1 style="color: #C8FF00; text-align: center;">¡Tu pedido fue despachado!</h1>' +
        '<p style="color: #C7C7C0;">Tu pedido <strong style="color: #C8FF00;">' + orderNumber + '</strong> esta en camino.</p>' +
        '<div style="background-color: #0C0C0C; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
        '<p style="color: #C7C7C0;">Numero de seguimiento: <strong style="color: #C8FF00;">' + trackingNumber + '</strong></p>' +
        (trackingUrl ? '<p style="color: #C7C7C0;">Podes seguir tu envio <a href="' + trackingUrl + '" style="color: #C8FF00;">aca</a></p>' : '') +
        '</div></div></body></html>';
      subject = 'Tu Pedido ' + orderNumber + ' fue despachado - Home Padel';
    }

    return this.sendEmail(to, subject, html);
  }

  async sendContactNotification(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    const template = await this.getTemplateByType('contact_form');
    const config = await this.getConfig();
    const adminEmail = config?.adminEmail || 'contactohomepadel@gmail.com';

    let html: string;
    let emailSubject: string;

    if (template) {
      html = this.replaceVariables(template.content, {
        contactName: data.name,
        contactEmail: data.email,
        contactPhone: data.phone || 'No proporcionado',
        contactSubject: data.subject || 'Sin asunto',
        contactMessage: data.message.replace(/\n/g, '<br>'),
      });
      emailSubject = this.replaceVariables(template.subject, {
        contactName: data.name,
        contactSubject: data.subject || 'Sin asunto',
      });
    } else {
      html = '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background-color: #0C0C0C; color: #F7F6F7; padding: 20px;">' +
        '<div style="max-width: 600px; margin: 0 auto; background-color: #1A1F21; border-radius: 8px; padding: 30px;">' +
        '<h1 style="color: #C8FF00;">Nuevo mensaje de contacto</h1>' +
        '<p><strong style="color: #C8FF00;">Nombre:</strong> ' + data.name + '</p>' +
        '<p><strong style="color: #C8FF00;">Email:</strong> ' + data.email + '</p>' +
        '<p><strong style="color: #C8FF00;">Telefono:</strong> ' + (data.phone || 'No proporcionado') + '</p>' +
        '<p><strong style="color: #C8FF00;">Asunto:</strong> ' + (data.subject || 'Sin asunto') + '</p>' +
        '<div style="background-color: #0C0C0C; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
        '<p style="color: #C7C7C0;">' + data.message.replace(/\n/g, '<br>') + '</p></div>' +
        '</div></body></html>';
      emailSubject = 'Nuevo mensaje de contacto: ' + (data.subject || 'Sin asunto');
    }

    return this.sendEmail(adminEmail, emailSubject, html);
  }

  async sendCampaign(to: string, subject: string, content: string) {
    return this.sendEmail(to, subject, content);
  }
}