import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { ProcessTransactionUseCase } from '../application/useCases/process-transaction.use-case';
import { RMQ_CONFIG } from '../infra/messaging/rmq.config';

interface TransactionProcessMessage {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amountCents: number;
  idempotencyKey: string;
}

/**
 * RMQ event handlers for clients-service.
 */
@Controller()
export class ClientsRmqController {
  constructor(
    private readonly processTransactionUseCase: ProcessTransactionUseCase,
  ) {}

  /**
   * Handles transaction processing events emitted by transactions-service.
   */
  @EventPattern(RMQ_CONFIG.patterns.process)
  async handleTransactionProcess(
    @Payload() message: TransactionProcessMessage,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    const channel = ctx.getChannelRef();
    const originalMessage = ctx.getMessage();
    try {
      await this.processTransactionUseCase.execute(message);
      channel.ack(originalMessage);
    } catch (error) {
      channel.nack(originalMessage, false, true);
      throw error;
    }
  }
}
