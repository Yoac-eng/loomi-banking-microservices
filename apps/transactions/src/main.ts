import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { RMQ_CONFIG } from './infra/messaging/rmq.config';
import { TransactionsModule } from './transactions.module';

async function bootstrap() {
  const app = await NestFactory.create(TransactionsModule);
  app.useGlobalFilters(new ZodExceptionFilter());

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: RMQ_CONFIG.queues.completed,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.port ?? 3001);

  console.log(`
    🚀 Transactions service running on http://localhost:${process.env.port ?? 3001}`);
}
bootstrap();
