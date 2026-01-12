export interface UserCredentials {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string | null;
}

export interface IUserCredentialsRepository {
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
}
