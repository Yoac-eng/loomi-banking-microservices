import { NestFactory } from '@nestjs/core';

import { ClientsModule } from './clients.module';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);
  app.useGlobalFilters(new ZodExceptionFilter());
  await app.listen(process.env.CLIENTS_PORT ?? 3000);

  console.log(`
    🚀 Clients service running on http://localhost:${process.env.CLIENTS_PORT ?? 3000}`);
}
bootstrap();
