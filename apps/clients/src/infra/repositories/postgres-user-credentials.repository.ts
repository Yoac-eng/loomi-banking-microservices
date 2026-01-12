import { Injectable } from '@nestjs/common';

import type {
  IUserCredentialsRepository,
  UserCredentials,
} from '../../domain/interfaces/repositories/user-credentials.repository.interface';
import { prisma } from '../lib/prisma';

@Injectable()
export class PostgresUserCredentialsRepository implements IUserCredentialsRepository {
  public async findCredentialsByEmail(
    email: string,
  ): Promise<UserCredentials | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
    };
  }
}
