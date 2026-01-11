import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // map the errors to a format that is easy to understand
    const formattedErrors = exception.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: formattedErrors,
    });
  }
}
