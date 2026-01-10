import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import type { IStorageRepository } from '../../domain/interfaces/repositories/storage.repository.interface';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';

@Injectable()
export class UpdateProfilePictureUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IStorageRepository')
    private readonly storageRepository: IStorageRepository,
  ) {}

  async execute(userId: string, file: Buffer, mimetype: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fileExtension = this.getFileExtensionFromMimeType(mimetype);
    const filename = `${userId}/profile-picture.${fileExtension}`;

    const profilePictureUrl = await this.storageRepository.uploadFile(
      file,
      filename,
      mimetype,
    );

    user.updateProfile({
      profilePictureUrl,
    });

    await this.userRepository.updateProfile(user);

    return user;
  }

  private getFileExtensionFromMimeType(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
    };
    return mimeToExt[mimetype] || 'jpg';
  }
}
