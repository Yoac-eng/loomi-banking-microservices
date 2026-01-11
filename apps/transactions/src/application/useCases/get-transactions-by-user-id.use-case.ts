import { Injectable, Inject } from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';

@Injectable()
export class GetTransactionsByUserIdUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(userId);
  }
}
