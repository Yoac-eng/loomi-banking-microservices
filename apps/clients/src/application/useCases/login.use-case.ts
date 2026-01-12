import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import type { IUserCredentialsRepository } from '../../domain/interfaces/repositories/user-credentials.repository.interface';

const JWT_EXPIRES_IN_SECONDS = 3600;

export interface LoginResult {
  readonly accessToken: string;
  readonly expiresIn: number;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserCredentialsRepository')
    private readonly userCredentialsRepository: IUserCredentialsRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(data: {
    email: string;
    password: string;
  }): Promise<LoginResult> {
    const credentials =
      await this.userCredentialsRepository.findCredentialsByEmail(data.email);
    if (!credentials || !credentials.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValidPassword = await compare(
      data.password,
      credentials.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.jwtService.signAsync({
      sub: credentials.id,
      email: credentials.email,
      tokenType: 'user',
    });
    return { accessToken, expiresIn: JWT_EXPIRES_IN_SECONDS };
  }
}
