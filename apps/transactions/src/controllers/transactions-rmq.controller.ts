import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { ProcessTransactionCompletedUseCase } from '../application/useCases/process-transaction-completed.use-case';
import type { TransactionCompletedMessage } from '../domain/interfaces/messaging/broker-message-consumer.interface';
import { RMQ_CONFIG } from '../infra/messaging/rmq.config';

/**
 * RMQ event handlers for transactions-service.
 */
@Controller()
export class TransactionsRmqController {
  constructor(
    private readonly processTransactionCompletedUseCase: ProcessTransactionCompletedUseCase,
  ) {}

  /**
   * Handles transaction completion events emitted by clients-service.
   */
  @EventPattern(RMQ_CONFIG.patterns.completed)
  async handleTransactionCompleted(
    @Payload() message: TransactionCompletedMessage,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    const channel = ctx.getChannelRef();
    const originalMessage = ctx.getMessage();
    try {
      await this.processTransactionCompletedUseCase.execute(message);
      channel.ack(originalMessage);
    } catch (error) {
      channel.nack(originalMessage, false, true);
      throw error;
    }
  }
}
