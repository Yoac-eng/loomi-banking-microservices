export interface UserBankingInfo {
  id: string;
  bankingDetails: {
    balanceCents: number;
    accountNumber: string;
    agency: string;
  } | null;
}

export interface IClientsServiceClient {
  getUserWithBankingDetails(userId: string): Promise<UserBankingInfo>;
}
