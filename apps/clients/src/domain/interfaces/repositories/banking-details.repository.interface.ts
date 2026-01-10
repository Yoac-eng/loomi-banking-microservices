import { BankingDetails } from '../../entities/banking-details.entity';

export interface IBankingDetailsRepository {
  create(
    bankingDetails: Omit<BankingDetails, 'id' | 'updatedAt'>,
  ): Promise<BankingDetails>;
  findById(id: string): Promise<BankingDetails | null>;
  findByUserId(userId: string): Promise<BankingDetails | null>;
  findByAccountNumber(accountNumber: string): Promise<BankingDetails | null>;
  update(
    id: string,
    data: Partial<Omit<BankingDetails, 'id' | 'userId'>>,
  ): Promise<BankingDetails>;
  updateBalance(id: string, newBalanceCents: number): Promise<BankingDetails>;
}
