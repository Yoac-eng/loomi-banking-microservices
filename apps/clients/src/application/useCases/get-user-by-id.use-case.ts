import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findByIdWithBankingDetails(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.hasBankingDetails()) {
      throw new NotFoundException('Banking details not found for this user');
    }
    return user;
  }
}
