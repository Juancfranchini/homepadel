import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  @Post()
  sendMessage(@Body() body: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    console.log('Mensaje de contacto recibido:', JSON.stringify(body));
    // TODO: enviar email al admin
    return { success: true, message: 'Mensaje recibido correctamente' };
  }
}
