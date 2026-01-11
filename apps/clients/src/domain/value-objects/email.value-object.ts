export class Email {
  private readonly _value: string;

  constructor(email: string) {
    this.validate(email);
    this._value = this.normalize(email);
  }

  get value(): string {
    return this._value;
  }

  private validate(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    // Regex para validação de email (RFC 5322 simplificado)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (email.length > 254) {
      throw new Error('Email is too long (max 254 characters)');
    }

    const [localPart, domain] = email.split('@');

    if (localPart.length > 64) {
      throw new Error('Email local part is too long (max 64 characters)');
    }

    if (!domain || domain.length === 0) {
      throw new Error('Email domain is required');
    }
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}
