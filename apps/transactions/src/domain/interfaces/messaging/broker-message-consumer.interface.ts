export interface TransactionCompletedMessage {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

export interface IBrokerMessageConsumer {
  onTransactionCompleted(
    handler: (message: TransactionCompletedMessage) => Promise<void>,
  ): void;
}
