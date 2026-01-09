import { NestFactory } from '@nestjs/core';

import { TransactionsModule } from './transactions.module';

async function bootstrap() {
  const app = await NestFactory.create(TransactionsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
