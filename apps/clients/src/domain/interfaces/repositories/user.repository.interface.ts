import { User } from '../../entities/user.entity';

export interface IUserRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt'>>,
  ): Promise<User>;
  delete(id: string): Promise<void>;
}
