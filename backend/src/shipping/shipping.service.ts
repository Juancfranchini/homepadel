import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ShipmentRequest {
  orderId: string;
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCP: string;
  recipientProvince: string;
  recipientPhone: string;
  weight?: number;
  declaredValue?: number;
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private prisma: PrismaService) {}

  private async getCredentials() {
    const section = await this.prisma.siteSection.findUnique({
      where: { key: 'payment_methods' },
    });
    const ca = (section?.data as any)?.ca || (section?.data as any)?.correo_argentino || {};
    return ca;
  }

  async createShipment(data: ShipmentRequest) {
    const credentials = await this.getCredentials();

    if (!credentials.apiKey || !credentials.agreement) {
      this.logger.warn('Correo Argentino API Key o Agreement no configurado');
      return {
        success: false,
        message: 'Correo Argentino no configurado. Falta API Key o Agreement.',
      };
    }

    // TODO: Integrar con API de Correo Argentino Paq.ar
    // 1. POST /auth - obtener token
    // 2. POST /orden - crear orden de envío
    // 3. Generar rotulo
    // 4. Guardar trackingNumber

    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: data.orderId,
        carrier: 'CORREO_ARGENTINO',
        status: 'PENDING',
        trackingNumber: null,
      },
    });

    this.logger.log('Envio creado (pendiente de API): ' + shipment.id);
    return shipment;
  }

  async getShipmentByOrderId(orderId: string) {
    return this.prisma.shipment.findUnique({ where: { orderId } });
  }

  async updateTracking(orderId: string, trackingNumber: string, labelUrl?: string) {
    return this.prisma.shipment.update({
      where: { orderId },
      data: { trackingNumber, labelUrl, status: 'SHIPPED' },
    });
  }

  async cancelShipment(orderId: string) {
    return this.prisma.shipment.update({
      where: { orderId },
      data: { status: 'CANCELLED' },
    });
  }

  async getAllShipments() {
    return this.prisma.shipment.findMany({
      include: { order: { select: { number: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}