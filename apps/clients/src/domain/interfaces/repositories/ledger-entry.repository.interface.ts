import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { LedgerEntryType } from '../../enum/ledger-entry-type.enum';

export interface ILedgerEntryRepository {
  create(ledgerEntry: LedgerEntry): Promise<LedgerEntry>;
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
