// Upload de imágenes para productos, banners, categorías, etc.
// POST /api/uploads/image — sube una imagen y retorna { url: "data:image/png;base64,..." }
// Requiere autenticación ADMIN
// El campo del form-data debe llamarse 'file'

import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('uploads')
export class UploadsController {
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return { url: dataUrl };
  }
}
