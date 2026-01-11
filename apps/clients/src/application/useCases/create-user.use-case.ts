import { Injectable, Inject, ConflictException } from '@nestjs/common';

import { BankingDetails } from '../../domain/entities/banking-details.entity';
import { User } from '../../domain/entities/user.entity';
import { AccountType } from '../../domain/enum/account-type.enum';
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
      throw new ConflictException('User with this email already exists');
    }

    const emailValueObject = new Email(data.email);
    const user = new User({
      fullName: data.fullName,
      email: emailValueObject,
      address: data.address ?? null,
      profilePictureUrl: data.profilePictureUrl ?? null,
    });
    const bankingDetails = new BankingDetails({
      userId: user.id,
      agency: data.bankingDetails.agency,
      accountNumber: data.bankingDetails.accountNumber,
      accountType:
        data.bankingDetails.accountType === 'CHECKING'
          ? AccountType.CHECKING
          : AccountType.SAVINGS,
      balanceCents: 0, // balance is set to 0 by default
      updatedAt: new Date(),
    });
    user.attachBankingDetails(bankingDetails);
    await this.userRepository.create(user);
    return user;
  }
}
