import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { Email } from '../../domain/value-objects/email.value-object';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, data: UpdateUserDto): Promise<User> {
    let user: User | null;
    if (data.bankingDetails) {
      user = await this.userRepository.findByIdWithBankingDetails(userId);
    } else {
      user = await this.userRepository.findById(userId);
    }

    if (!user) throw new NotFoundException('User not found');

    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      // Verifica se existe E se não é o próprio usuário
      if (existingUser && existingUser.id !== userId) {
        throw new Error('User with this email already exists');
      }
    }

    user.updateProfile({
      fullName: data.fullName,
      email: data.email ? new Email(data.email) : undefined,
      address: data.address,
    });

    if (data.bankingDetails) {
      if (!user.hasBankingDetails())
        throw new NotFoundException('Banking details not found for this user');

      user.updateBankingDetails(data.bankingDetails);
      await this.userRepository.updateFinancials(user);
    } else {
      await this.userRepository.updateProfile(user);
    }

    return user;
  }
}
