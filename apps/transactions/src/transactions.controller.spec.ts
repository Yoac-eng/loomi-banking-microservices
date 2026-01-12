import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { CreateTransactionUseCase } from './application/useCases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/useCases/get-transaction-by-id.use-case';
import { GetTransactionsByUserIdUseCase } from './application/useCases/get-transactions-by-user-id.use-case';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { TransactionsController } from './controllers/transactions.controller';

describe('TransactionsController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const jwtSecret: string = 'test-jwt-secret';
  const createTransactionUseCase: { execute: jest.Mock } = {
    execute: jest.fn(),
  };
  const getTransactionByIdUseCase: { execute: jest.Mock } = {
    execute: jest.fn(),
  };
  const getTransactionsByUserIdUseCase: { execute: jest.Mock } = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = jwtSecret;

    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
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
        {
          provide: CreateTransactionUseCase,
          useValue: createTransactionUseCase,
        },
        {
          provide: GetTransactionByIdUseCase,
          useValue: getTransactionByIdUseCase,
        },
        {
          provide: GetTransactionsByUserIdUseCase,
          useValue: getTransactionsByUserIdUseCase,
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
      .get('/api/transactions/user/invalid')
      .expect(401);
  });

  it('should return 400 when body fails zod validation', async () => {
    const accessToken: string = await jwtService.signAsync({
      sub: '11111111-1111-1111-1111-111111111111',
      tokenType: 'user',
    });
    await request(app.getHttpServer())
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ senderUserId: 'not-uuid' })
      .expect(400);
  });

  it('should create a transaction (happy path)', async () => {
    const accessToken: string = await jwtService.signAsync({
      sub: '11111111-1111-1111-1111-111111111111',
      tokenType: 'user',
    });
    const inputSenderUserId: string = '2f1b5e1c-3a5d-4e8d-8b9a-0f2d3c4b5a6e';
    const inputReceiverUserId: string =
      '7c6d5e4f-3b2a-1c0d-9e8f-7a6b5c4d3e2f';
    const inputIdempotencyKey: string = 'idem-test-1';
    const expectedBody: Record<string, unknown> = {
      id: '11111111-1111-1111-1111-111111111111',
      senderUserId: inputSenderUserId,
      receiverUserId: inputReceiverUserId,
      amountCents: 1500,
      description: 'Lunch split',
      status: 'PENDING',
      idempotencyKey: inputIdempotencyKey,
      createdAt: new Date('2026-01-11T12:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-01-11T12:00:00.000Z').toISOString(),
    };

    createTransactionUseCase.execute.mockResolvedValue({
      toJson: () => expectedBody,
    });

    await request(app.getHttpServer())
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        senderUserId: inputSenderUserId,
        receiverUserId: inputReceiverUserId,
        amount: 1500,
        description: 'Lunch split',
        idempotencyKey: inputIdempotencyKey,
      })
      .expect(201)
      .expect(expectedBody);
  });
});
