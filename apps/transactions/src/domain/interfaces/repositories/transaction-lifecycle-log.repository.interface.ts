import { TransactionLifecycleLog } from '../../entities/transaction-lifecycle-log.entity';

export interface ITransactionLifecycleLogRepository {
  create(log: TransactionLifecycleLog): Promise<void>;
  findByTransactionId(
    transactionId: string,
  ): Promise<TransactionLifecycleLog[]>;
  findById(id: string): Promise<TransactionLifecycleLog | null>;
}
