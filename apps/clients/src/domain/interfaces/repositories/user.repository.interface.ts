import { User } from '../../entities/user.entity';
import { Email } from '../../value-objects/email.value-object';

export interface CreateUserData {
  fullName: string;
  email: Email;
  address: string | null;
  profilePictureUrl: string | null;
}

export interface UpdateUserData {
  fullName?: string;
  email?: Email;
  address?: string | null;
  profilePictureUrl?: string | null;
}

export interface IUserRepository {
  create(user: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}
