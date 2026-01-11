import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { ClientsModule } from './clients.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { RMQ_CONFIG } from './infra/messaging/rmq.config';

async function bootstrap() {
  const app = await NestFactory.create(ClientsModule);
  app.useGlobalFilters(
    new ZodExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: RMQ_CONFIG.queues.process,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.CLIENTS_PORT ?? 3000);

  console.log(`
    🚀 Clients service running on http://localhost:${process.env.CLIENTS_PORT ?? 3000}`);
}
bootstrap();
