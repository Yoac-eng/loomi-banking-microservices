import { Transaction } from '../../entities/transaction.entity';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findBySenderUserId(userId: string): Promise<Transaction[]>;
  findByReceiverUserId(userId: string): Promise<Transaction[]>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByIdempotencyKey(key: string): Promise<Transaction | null>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
