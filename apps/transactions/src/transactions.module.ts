import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { TransactionLifecycleLogger } from './application/services/transaction-lifecycle-logger.service';
import { CreateTransactionUseCase } from './application/useCases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/useCases/get-transaction-by-id.use-case';
import { GetTransactionsByUserIdUseCase } from './application/useCases/get-transactions-by-user-id.use-case';
import { ProcessTransactionCompletedUseCase } from './application/useCases/process-transaction-completed.use-case';
import { UpdateTransactionStatusUseCase } from './application/useCases/update-transaction-status.use-case';
import { TransactionsRmqController } from './controllers/transactions-rmq.controller';
import { TransactionsController } from './controllers/transactions.controller';
import type { ICache } from './domain/interfaces/repositories/cache/cache.provider.interface';
import type { ITransactionRepository } from './domain/interfaces/repositories/transaction.repository.interface';
import { ClientsServiceClient } from './infra/http/clients-service-client';
import { RabbitMQPublisher } from './infra/messaging/rabbitmq-publisher';
import { RMQ_CONFIG } from './infra/messaging/rmq.config';
import { RedisCache } from './infra/repositories/cache/redis.cache';
import { CachedTransactionRepository } from './infra/repositories/cached-transaction.repository';
import { PostgresTransactionLifecycleLogRepository } from './infra/repositories/postgres-transaction-lifecycle-log.repository';
import { PostgresTransactionRepository } from './infra/repositories/postgres-transaction.repository';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CLIENTS_RMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: RMQ_CONFIG.queues.process,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [TransactionsController, TransactionsRmqController],
  providers: [
    PostgresTransactionRepository,
    {
      provide: 'ITransactionRepositoryDelegate',
      useClass: PostgresTransactionRepository,
    },
    {
      provide: 'ICache',
      useClass: RedisCache,
    },
    {
      provide: 'ITransactionRepository',
      useFactory: (delegate: ITransactionRepository, cache: ICache) => {
        return new CachedTransactionRepository(delegate, cache);
      },
      inject: ['ITransactionRepositoryDelegate', 'ICache'],
    },
    PostgresTransactionLifecycleLogRepository,
    {
      provide: 'ITransactionLifecycleLogRepository',
      useClass: PostgresTransactionLifecycleLogRepository,
    },
    {
      provide: 'IBrokerMessagePublisher',
      useClass: RabbitMQPublisher,
    },
    {
      provide: 'IClientsServiceClient',
      useClass: ClientsServiceClient,
    },
    TransactionLifecycleLogger,
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    GetTransactionsByUserIdUseCase,
    UpdateTransactionStatusUseCase,
    ProcessTransactionCompletedUseCase,
  ],
})
export class TransactionsModule {}
