import { Inject, Injectable } from '@nestjs/common';

import { TransactionLifecycleLog } from '../../domain/entities/transaction-lifecycle-log.entity';
import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { ITransactionLifecycleLogRepository } from '../../domain/interfaces/repositories/transaction-lifecycle-log.repository.interface';

@Injectable()
export class TransactionLifecycleLogger {
  constructor(
    @Inject('ITransactionLifecycleLogRepository')
    private readonly logRepository: ITransactionLifecycleLogRepository,
  ) {}

  async logStatusChange(
    transactionId: string,
    oldStatus: TransactionStatus | null,
    newStatus: TransactionStatus,
    message?: string,
  ): Promise<void> {
    const log = new TransactionLifecycleLog({
      transactionId,
      oldStatus,
      newStatus,
      message: message ?? null,
    });

    await this.logRepository.create(log);
  }
}
