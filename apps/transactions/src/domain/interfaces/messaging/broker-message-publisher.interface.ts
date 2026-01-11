export interface TransactionProcessMessage {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amountCents: number;
  idempotencyKey: string;
}

export interface IBrokerMessagePublisher {
  publishTransactionProcess(message: TransactionProcessMessage): Promise<void>;
}
