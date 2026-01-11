import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import type {
  IBrokerMessagePublisher,
  TransactionProcessMessage,
} from '../../domain/interfaces/messaging/broker-message-publisher.interface';

import { RMQ_CONFIG } from './rmq.config';

@Injectable()
export class RabbitMQPublisher implements IBrokerMessagePublisher {
  private readonly logger = new Logger(RabbitMQPublisher.name);

  constructor(
    @Inject('CLIENTS_RMQ_CLIENT')
    private readonly clientsRmqClient: ClientProxy,
  ) {}

  async publishTransactionProcess(
    message: TransactionProcessMessage,
  ): Promise<void> {
    try {
      // publish transaction process message to clients-service queue
      await firstValueFrom(
        this.clientsRmqClient.emit(RMQ_CONFIG.patterns.process, message),
      );
      this.logger.log(
        `Published transaction.process message for transaction ${message.transactionId}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to publish transaction.process: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
