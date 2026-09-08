import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '../email/email.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendMessage(@Body() body: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    try {
      await this.emailService.sendContactNotification(body);
      return { success: true, message: 'Mensaje recibido correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al enviar el mensaje' };
    }
  }
}