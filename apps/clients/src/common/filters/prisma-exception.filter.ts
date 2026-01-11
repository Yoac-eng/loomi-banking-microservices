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
      const fields = this.getUniqueConstraintFields(exception);

      // Mensagens para constraints compostas
      const sortedFields = fields.sort().join('+');
      const compositeMessages: Record<string, string> = {
        'account_number+agency':
          'Bank account already exists (agency + account number)',
        'agency+account_number':
          'Bank account already exists (agency + account number)',
      };

      // Mensagens para campos únicos simples
      const singleFieldMessages: Record<string, string> = {
        email: 'Email already exists',
        account_number: 'Account number already exists',
        accountNumber: 'Account number already exists',
      };

      const message =
        compositeMessages[sortedFields] ??
        (fields.length === 1
          ? (singleFieldMessages[fields[0]] ??
            `Conflict: ${fields[0]} already exists`)
          : `Conflict: unique constraint violation (${fields.join(', ')})`);

      return response.status(status).json({
        statusCode: status,
        message,
      });
    }

    // P2025: Record not found
    if (exception.code === 'P2025') {
      const status = HttpStatus.NOT_FOUND;
      return response.status(status).json({
        statusCode: status,
        message: 'Record not found',
      });
    }

    // P2023: Inconsistent column data
    if (exception.code === 'P2023') {
      const status = HttpStatus.BAD_REQUEST;
      return response.status(status).json({
        statusCode: status,
        message: 'Invalid database input data',
      });
    }

    // Erro genérico para outros casos não tratados
    // Log completo no servidor para debug, mas retorna mensagem genérica
    console.error('Unhandled Prisma error:', {
      code: exception.code,
      message: exception.message,
      meta: exception.meta,
    });

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An error occurred while processing your request',
    });
  }

  private getUniqueConstraintFields(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string[] {
    const meta = exception.meta as unknown;

    // Try meta.target (Prisma's standard way)
    const metaTarget = (meta as { target?: unknown }).target;
    if (
      Array.isArray(metaTarget) &&
      metaTarget.every((x) => typeof x === 'string')
    ) {
      return metaTarget as string[];
    }
    if (typeof metaTarget === 'string') {
      return [metaTarget];
    }

    // Try driverAdapterError.cause.constraint.fields (PostgreSQL adapter)
    const driverAdapterError = (meta as { driverAdapterError?: unknown })
      .driverAdapterError;
    const cause = (driverAdapterError as { cause?: unknown })?.cause as
      | { constraint?: { fields?: unknown } }
      | undefined;

    const constraintFields = cause?.constraint?.fields;
    if (
      Array.isArray(constraintFields) &&
      constraintFields.every((x) => typeof x === 'string')
    ) {
      return constraintFields as string[];
    }

    // Fallback: try to parse from error message
    const messageMatch = /fields:\s+\(`([^`]+)`(?:,\s*`([^`]+)`)?\)/.exec(
      exception.message,
    );
    if (messageMatch?.[1]) {
      const fields = [messageMatch[1]];
      if (messageMatch[2]) {
        fields.push(messageMatch[2]);
      }
      return fields;
    }

    return ['field'];
  }
}
