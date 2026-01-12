import 'dotenv/config';
import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type {
  IClientsServiceClient,
  UserBankingInfo,
} from '../../domain/interfaces/http/clients-service-client.interface';

interface ClientsServiceResponse {
  id: string;
  bankingDetails: {
    id: string;
    agency: string;
    accountNumber: string;
    accountType: string;
    balanceCents: string;
    updatedAt: string | Date | null;
  } | null;
}

@Injectable()
export class ClientsServiceClient implements IClientsServiceClient {
  private readonly baseUrl: string;
  private readonly logger = new Logger(ClientsServiceClient.name);

  constructor(private readonly jwtService: JwtService) {
    this.baseUrl = process.env.CLIENTS_SERVICE_URL || 'http://localhost:3000';
    if (!this.baseUrl) {
      throw new Error('CLIENTS_SERVICE_URL environment variable is required');
    }
  }

  async getUserWithBankingDetails(userId: string): Promise<UserBankingInfo> {
    const url = `${this.baseUrl}/api/users/${userId}`;

    try {
      const serviceToken = await this.jwtService.signAsync({
        sub: 'transactions-service',
        tokenType: 'service',
      });
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(
            `User with id ${userId} not found in clients service`,
          );
        }
        if (response.status >= 500) {
          throw new ServiceUnavailableException(
            `Clients service returned error: ${response.status} ${response.statusText}`,
          );
        }
        throw new InternalServerErrorException(
          `Unexpected error from clients service: ${response.status} ${response.statusText}`,
        );
      }

      const data: ClientsServiceResponse = await response.json();

      if (!data || typeof data.id !== 'string') {
        throw new InternalServerErrorException(
          'Invalid response format from clients service',
        );
      }

      return {
        id: data.id,
        bankingDetails: data.bankingDetails
          ? {
              balanceCents: BigInt(data.bankingDetails.balanceCents),
              accountNumber: data.bankingDetails.accountNumber,
              agency: data.bankingDetails.agency,
            }
          : null,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.logger.error(
          `Failed to connect to clients service at ${this.baseUrl}`,
          error.stack,
        );
        throw new ServiceUnavailableException('Clients service is unavailable');
      }

      this.logger.error(
        `Unexpected error when calling clients service: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve user banking details',
      );
    }
  }
}
