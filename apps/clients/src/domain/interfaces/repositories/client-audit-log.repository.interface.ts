import { ClientAuditLog } from '../../entities/client-audit-log.entity';

export interface IClientAuditLogRepository {
  create(
    auditLog: Omit<ClientAuditLog, 'id' | 'createdAt'>,
  ): Promise<ClientAuditLog>;
  findById(id: string): Promise<ClientAuditLog | null>;
  findByUserId(userId: string): Promise<ClientAuditLog[]>;
  findByUserIdAndAction(
    userId: string,
    action: string,
  ): Promise<ClientAuditLog[]>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClientAuditLog[]>;
}
