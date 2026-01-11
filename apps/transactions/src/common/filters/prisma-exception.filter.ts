import { Prisma } from '@generated/clients';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // P2002: Unique constraint failed
    if (exception.code === 'P2002') {
      const status = HttpStatus.CONFLICT;
      return response.status(status).json({
        statusCode: status,
        message: `Conflict: Field '${exception.meta?.target}' already exists.`,
      });
    }

    // P2025: Record not found
    if (exception.code === 'P2025') {
      const status = HttpStatus.NOT_FOUND;
      return response.status(status).json({
        statusCode: status,
        message: 'Record not found.',
      });
    }

    // P2023: Inconsistent column data
    if (exception.code === 'P2023') {
      const status = HttpStatus.BAD_REQUEST;
      return response.status(status).json({
        statusCode: status,
        message: 'Invalid database input data.',
      });
    }

    // Erro genérico para outros casos não tratados
    console.error(exception); // Logar no servidor para debug
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
