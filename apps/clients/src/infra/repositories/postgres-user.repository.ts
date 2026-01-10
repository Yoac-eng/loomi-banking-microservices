import { Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UpdateUserData,
  IUserRepository,
} from '../../domain/interfaces/repositories/user.repository.interface';
import { Email } from '../../domain/value-objects/email.value-object';
import { prisma } from '../lib/prisma';

@Injectable()
export class PostgresUserRepository implements IUserRepository {
  async create(user: CreateUserData): Promise<User> {
    const created = await prisma.user.create({
      data: {
        fullName: user.fullName,
        email: user.email.toString(),
        address: user.address ?? null,
        profilePictureUrl: user.profilePictureUrl ?? null,
      },
    });
    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const found = await prisma.user.findUnique({
      where: { id },
    });
    if (!found) return null;
    return this.toDomainEntity(found);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findUnique({
      where: { email },
    });
    if (!found) return null;
    return this.toDomainEntity(found);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Record<string, unknown> = {};
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    }
    if (data.email !== undefined) {
      updateData.email = data.email.toString();
    }
    if (data.address !== undefined) {
      updateData.address = data.address;
    }
    if (data.profilePictureUrl !== undefined) {
      updateData.profilePictureUrl = data.profilePictureUrl;
    }
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  private toDomainEntity(prismaUser: {
    id: string;
    fullName: string;
    email: string;
    address: string | null;
    profilePictureUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      {
        fullName: prismaUser.fullName,
        email: new Email(prismaUser.email),
        address: prismaUser.address,
        profilePictureUrl: prismaUser.profilePictureUrl,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
      },
      prismaUser.id,
    );
  }
}
