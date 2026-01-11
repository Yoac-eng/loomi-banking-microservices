import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { RMQ_CONFIG } from './rmq.config';

interface TransactionCompletedMessage {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

@Injectable()
export class RabbitMQPublisher {
  private readonly logger = new Logger(RabbitMQPublisher.name);

  constructor(
    @Inject('TRANSACTIONS_RMQ_CLIENT')
    private readonly transactionsRmqClient: ClientProxy,
  ) {}

  async publishTransactionCompleted(
    message: TransactionCompletedMessage,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.transactionsRmqClient.emit(RMQ_CONFIG.patterns.completed, message),
      );
      this.logger.log(
        `Published transaction.completed message for transaction ${message.transactionId}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to publish transaction.completed: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
