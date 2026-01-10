import { LedgerEntryType } from '../../enum/ledger-entry-type.enum';
import { LedgerEntry } from '../../entities/ledger-entry.entity';

export interface ILedgerEntryRepository {
  create(
    ledgerEntry: Omit<LedgerEntry, 'id' | 'createdAt'>,
  ): Promise<LedgerEntry>;
  findById(id: string): Promise<LedgerEntry | null>;
  findByBankingId(bankingId: string): Promise<LedgerEntry[]>;
  findByTransactionId(transactionId: string): Promise<LedgerEntry | null>;
  findByBankingIdAndType(
    bankingId: string,
    type: LedgerEntryType,
  ): Promise<LedgerEntry[]>;
  findByBankingIdAndDateRange(
    bankingId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LedgerEntry[]>;
}
