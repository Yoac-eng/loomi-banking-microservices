import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';

@Injectable()
export class GetTransactionByIdUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
