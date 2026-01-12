import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';

import type { IUserCredentialsRepository } from '../../../src/domain/interfaces/repositories/user-credentials.repository.interface';
import { LoginUseCase } from '../../../src/application/useCases/login.use-case';

describe('LoginUseCase', () => {
  const jwtSecret: string = 'test-jwt-secret';

  function buildJwtService(): JwtService {
    return new JwtService({ secret: jwtSecret });
  }

  it('should return accessToken and expiresIn when credentials are valid', async () => {
    const inputEmail: string = 'user@example.com';
    const inputPassword: string = 'ChangeMe123!';
    const passwordHash: string = await hash(inputPassword, 10);
    const mockRepository: IUserCredentialsRepository = {
      findCredentialsByEmail: async (email: string) => {
        return {
          id: '11111111-1111-1111-1111-111111111111',
          email,
          passwordHash,
        };
      },
    };
    const jwtService: JwtService = buildJwtService();
    const useCase = new LoginUseCase(mockRepository, jwtService);
    const actual = await useCase.execute({
      email: inputEmail,
      password: inputPassword,
    });
    expect(typeof actual.accessToken).toBe('string');
    expect(actual.accessToken.length).toBeGreaterThan(10);
    expect(actual.expiresIn).toBe(3600);
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    const mockRepository: IUserCredentialsRepository = {
      findCredentialsByEmail: async () => null,
    };
    const jwtService: JwtService = buildJwtService();
    const useCase = new LoginUseCase(mockRepository, jwtService);
    await expect(
      useCase.execute({ email: 'missing@example.com', password: 'x' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    const inputEmail: string = 'user@example.com';
    const mockRepository: IUserCredentialsRepository = {
      findCredentialsByEmail: async (email: string) => {
        return {
          id: '11111111-1111-1111-1111-111111111111',
          email,
          passwordHash: await hash('correct-password', 10),
        };
      },
    };
    const jwtService: JwtService = buildJwtService();
    const useCase = new LoginUseCase(mockRepository, jwtService);
    await expect(
      useCase.execute({ email: inputEmail, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});


