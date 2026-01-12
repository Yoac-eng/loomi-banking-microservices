export interface TransactionProcessMessage {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amountCents: string;
  idempotencyKey: string;
}

export interface IBrokerMessagePublisher {
  publishTransactionProcess(message: TransactionProcessMessage): Promise<void>;
}
