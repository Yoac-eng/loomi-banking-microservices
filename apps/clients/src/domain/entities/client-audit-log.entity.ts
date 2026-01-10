import { randomUUID } from 'crypto';

interface ClientAuditLogProps {
  userId: string;
  action: string;
  changedFields: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: Date;
}

export class ClientAuditLog {
  private readonly _id: string;
  private readonly _props: ClientAuditLogProps;

  constructor(props: ClientAuditLogProps, id?: string) {
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._props.userId;
  }

  get action(): string {
    return this._props.action;
  }

  get changedFields(): Record<string, unknown> {
    return this._props.changedFields;
  }

  get ipAddress(): string | null {
    return this._props.ipAddress ?? null;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      ...this._props,
    };
  }
}
