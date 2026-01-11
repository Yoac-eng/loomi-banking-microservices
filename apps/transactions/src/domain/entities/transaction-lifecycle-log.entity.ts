import { randomUUID } from 'crypto';

import { TransactionStatus } from '../enum/transaction-status.enum';

interface TransactionLifecycleLogProps {
  transactionId: string;
  oldStatus: TransactionStatus | null;
  newStatus: TransactionStatus;
  message?: string | null;
  createdAt?: Date;
}

export class TransactionLifecycleLog {
  private readonly _id: string;
  private readonly _props: TransactionLifecycleLogProps;

  constructor(props: TransactionLifecycleLogProps, id?: string) {
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get transactionId(): string {
    return this._props.transactionId;
  }

  get oldStatus(): TransactionStatus | null {
    return this._props.oldStatus ?? null;
  }

  get newStatus(): TransactionStatus {
    return this._props.newStatus;
  }

  get message(): string | null {
    return this._props.message ?? null;
  }

  get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      transactionId: this._props.transactionId,
      oldStatus: this._props.oldStatus,
      newStatus: this._props.newStatus,
      message: this._props.message,
      createdAt: this.createdAt,
    };
  }
}
