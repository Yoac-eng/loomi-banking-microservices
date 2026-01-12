import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { CreateUserUseCase } from './application/useCases/create-user.use-case';
import { GetUserByIdUseCase } from './application/useCases/get-user-by-id.use-case';
import { UpdateProfilePictureUseCase } from './application/useCases/update-profile-picture.use-case';
import { UpdateUserUseCase } from './application/useCases/update-user.use-case';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { ClientsController } from './controllers/clients.controller';

describe('ClientsController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const jwtSecret: string = 'test-jwt-secret';
  const createUserUseCase: { execute: jest.Mock } = { execute: jest.fn() };
  const getUserByIdUseCase: { execute: jest.Mock } = { execute: jest.fn() };
  const updateUserUseCase: { execute: jest.Mock } = { execute: jest.fn() };
  const updateProfilePictureUseCase: { execute: jest.Mock } = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = jwtSecret;

    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController],
      imports: [
        JwtModule.register({
          secret: jwtSecret,
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        { provide: CreateUserUseCase, useValue: createUserUseCase },
        { provide: GetUserByIdUseCase, useValue: getUserByIdUseCase },
        { provide: UpdateUserUseCase, useValue: updateUserUseCase },
        {
          provide: UpdateProfilePictureUseCase,
          useValue: updateProfilePictureUseCase,
        },
      ],
    }).compile();

    jwtService = moduleRef.get(JwtService);
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ZodExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 when bearer token is missing', async () => {
    await request(app.getHttpServer())
      .get('/api/users/11111111-1111-1111-1111-111111111111')
      .expect(401);
  });

  it('should return 400 when update body fails zod validation', async () => {
    const accessToken: string = await jwtService.signAsync({
      sub: '11111111-1111-1111-1111-111111111111',
      tokenType: 'user',
    });
    await request(app.getHttpServer())
      .patch('/api/users/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('should get a user (happy path)', async () => {
    const accessToken: string = await jwtService.signAsync({
      sub: '11111111-1111-1111-1111-111111111111',
      tokenType: 'user',
    });
    const inputUserId: string = '11111111-1111-1111-1111-111111111111';
    const expectedBody: Record<string, unknown> = {
      id: inputUserId,
      fullName: 'Ada Lovelace',
      email: 'ada@lovelace.dev',
      address: null,
      profilePictureUrl: null,
      createdAt: null,
      updatedAt: null,
      bankingDetails: {
        id: '22222222-2222-2222-2222-222222222222',
        agency: '0001',
        accountNumber: '123456-7',
        accountType: 'CHECKING',
        balanceCents: '50000',
        updatedAt: new Date('2026-01-11T12:00:00.000Z').toISOString(),
      },
    };

    getUserByIdUseCase.execute.mockResolvedValue({
      toJson: () => expectedBody,
    });

    await request(app.getHttpServer())
      .get(`/api/users/${inputUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(expectedBody);
  });
});

