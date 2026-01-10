import { Injectable, Inject } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { Email } from '../../domain/value-objects/email.value-object';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    const email = new Email(data.email);
    const existingUser = await this.userRepository.findByEmail(
      email.toString(),
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    const emailValueObject = new Email(data.email);
    return await this.userRepository.create({
      fullName: data.fullName,
      email: emailValueObject,
      address: data.address ?? null,
      profilePictureUrl: data.profilePictureUrl ?? null,
    });
  }
}
