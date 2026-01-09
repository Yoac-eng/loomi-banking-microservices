import { randomUUID } from 'crypto';

import { Email } from '../value-objects/email.value-object';

interface UserProps {
  fullName: string;
  email: Email;
  address?: string | null;
  profilePictureUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly _id: string;
  private readonly _props: UserProps;

  constructor(props: UserProps, id?: string) {
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get fullName(): string {
    return this._props.fullName;
  }

  get email(): Email {
    return this._props.email;
  }

  get address(): string | null {
    return this._props.address ?? null;
  }

  get profilePictureUrl(): string | null {
    return this._props.profilePictureUrl ?? null;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      fullName: this._props.fullName,
      email: this._props.email.toString(),
      address: this._props.address,
      profilePictureUrl: this._props.profilePictureUrl,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
    };
  }
}
