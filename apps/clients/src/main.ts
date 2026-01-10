import { NestFactory } from '@nestjs/core';

import { ClientsModule } from './clients.module';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);
  app.useGlobalFilters(new ZodExceptionFilter());
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
