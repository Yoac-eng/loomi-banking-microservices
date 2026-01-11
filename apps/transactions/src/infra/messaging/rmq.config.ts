export const RMQ_CONFIG = {
  queues: {
    /**
     * Queue consumed by clients-service.
     */
    process: 'transactions.process',
    /**
     * Queue consumed by transactions-service.
     */
    completed: 'transactions.completed',
  },
  patterns: {
    process: 'transaction.process',
    completed: 'transaction.completed',
  },
} as const;
