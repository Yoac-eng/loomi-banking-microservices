import { User } from '../../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<void>;
  updateFinancials(user: User): Promise<void>;
  updateProfile(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByIdWithBankingDetails(id: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}
