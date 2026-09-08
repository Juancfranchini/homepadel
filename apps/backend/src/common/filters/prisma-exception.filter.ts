import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Error de base de datos';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con ese valor único.';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'No se puede eliminar o actualizar porque hay registros relacionados.';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'El registro no existe.';
        break;
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = 'El valor ingresado es demasiado largo.';
        break;
      default:
        message = 'Error de base de datos: ' + exception.code;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}