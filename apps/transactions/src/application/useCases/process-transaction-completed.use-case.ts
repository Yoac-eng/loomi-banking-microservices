import { Injectable, Inject, Logger } from '@nestjs/common';

import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { TransactionCompletedMessage } from '../../domain/interfaces/messaging/broker-message-consumer.interface';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';

import { UpdateTransactionStatusUseCase } from './update-transaction-status.use-case';

@Injectable()
export class ProcessTransactionCompletedUseCase {
  private readonly logger = new Logger(ProcessTransactionCompletedUseCase.name);

  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly updateStatusUseCase: UpdateTransactionStatusUseCase,
  ) {}

  async execute(message: TransactionCompletedMessage): Promise<void> {
    const transaction = await this.transactionRepository.findById(
      message.transactionId,
    );

    if (!transaction) {
      this.logger.warn(
        `Transaction ${message.transactionId} not found, ignoring message`,
      );
      return;
    }

    // Se já foi processada, ignorar (idempotência)
    if (!transaction.isPending()) {
      this.logger.log(
        `Transaction ${message.transactionId} already processed with status ${transaction.status}, ignoring`,
      );
      return;
    }

    // Atualizar status baseado no resultado
    const newStatus =
      message.status === 'SUCCESS'
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILED;

    const logMessage =
      message.status === 'SUCCESS'
        ? 'Transaction processed successfully'
        : `Transaction failed: ${message.errorMessage || 'Unknown error'}`;

    await this.updateStatusUseCase.execute(
      message.transactionId,
      newStatus,
      logMessage,
    );

    this.logger.log(
      `Transaction ${message.transactionId} updated to ${newStatus}`,
    );
  }
}
