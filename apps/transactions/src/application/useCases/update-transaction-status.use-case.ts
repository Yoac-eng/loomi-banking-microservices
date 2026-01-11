import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';
import { TransactionLifecycleLogger } from '../services/transaction-lifecycle-logger.service';

@Injectable()
export class UpdateTransactionStatusUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly lifecycleLogger: TransactionLifecycleLogger,
  ) {}

  async execute(
    transactionId: string,
    newStatus: TransactionStatus,
    message?: string,
  ): Promise<Transaction> {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const oldStatus = transaction.status;

    // Validar e atualizar status
    transaction.updateStatus(newStatus, message);

    // Criar log de mudança
    await this.lifecycleLogger.logStatusChange(
      transactionId,
      oldStatus,
      newStatus,
      message,
    );

    // Salvar alterações
    await this.transactionRepository.update(transaction);

    return transaction;
  }
}
