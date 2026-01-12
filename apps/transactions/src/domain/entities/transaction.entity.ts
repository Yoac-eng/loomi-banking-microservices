import { randomUUID } from 'crypto';

import { TransactionStatus } from '../enum/transaction-status.enum';
import { Amount } from '../value-objects/amount.value-object';

interface TransactionProps {
  senderUserId: string;
  receiverUserId: string;
  amount: Amount;
  description?: string | null;
  status: TransactionStatus;
  idempotencyKey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction {
  private readonly _id: string;
  private readonly _props: TransactionProps;

  constructor(props: TransactionProps, id?: string) {
    this.validateProps(props);
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get senderUserId(): string {
    return this._props.senderUserId;
  }

  get receiverUserId(): string {
    return this._props.receiverUserId;
  }

  get amount(): Amount {
    return this._props.amount;
  }

  get description(): string | null {
    return this._props.description ?? null;
  }

  get status(): TransactionStatus {
    return this._props.status;
  }

  get idempotencyKey(): string {
    return this._props.idempotencyKey;
  }

  get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  isPending(): boolean {
    return this._props.status === TransactionStatus.PENDING;
  }

  isFinal(): boolean {
    return (
      this._props.status === TransactionStatus.SUCCESS ||
      this._props.status === TransactionStatus.FAILED ||
      this._props.status === TransactionStatus.CANCELED
    );
  }

  canTransitionTo(newStatus: TransactionStatus): boolean {
    if (this.isFinal()) {
      return false;
    }
    if (this._props.status === TransactionStatus.PENDING) {
      return (
        newStatus === TransactionStatus.SUCCESS ||
        newStatus === TransactionStatus.FAILED ||
        newStatus === TransactionStatus.CANCELED
      );
    }
    return false;
  }

  markAsSuccess(): void {
    if (!this.canTransitionTo(TransactionStatus.SUCCESS)) {
      throw new Error(
        `Cannot transition from ${this._props.status} to SUCCESS`,
      );
    }
    this._props.status = TransactionStatus.SUCCESS;
    this._props.updatedAt = new Date();
  }

  markAsFailed(): void {
    if (!this.canTransitionTo(TransactionStatus.FAILED)) {
      throw new Error(`Cannot transition from ${this._props.status} to FAILED`);
    }
    this._props.status = TransactionStatus.FAILED;
    this._props.updatedAt = new Date();
  }

  markAsCanceled(): void {
    if (!this.canTransitionTo(TransactionStatus.CANCELED)) {
      throw new Error(
        `Cannot transition from ${this._props.status} to CANCELED`,
      );
    }
    this._props.status = TransactionStatus.CANCELED;
    this._props.updatedAt = new Date();
  }

  updateStatus(newStatus: TransactionStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this._props.status} to ${newStatus}`,
      );
    }
    this._props.status = newStatus;
    this._props.updatedAt = new Date();
  }

  private validateProps(props: TransactionProps): void {
    if (!props.senderUserId || props.senderUserId.trim().length === 0) {
      throw new Error('Sender user ID is required');
    }
    if (!props.receiverUserId || props.receiverUserId.trim().length === 0) {
      throw new Error('Receiver user ID is required');
    }
    if (props.senderUserId === props.receiverUserId) {
      throw new Error('Sender and receiver cannot be the same user');
    }
    if (props.amount.cents <= 0n) {
      throw new Error('Amount must be greater than zero');
    }
    if (!props.idempotencyKey || props.idempotencyKey.trim().length === 0) {
      throw new Error('Idempotency key is required');
    }
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      senderUserId: this._props.senderUserId,
      receiverUserId: this._props.receiverUserId,
      amountCents: this._props.amount.toString(),
      description: this._props.description,
      status: this._props.status,
      idempotencyKey: this._props.idempotencyKey,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
