// src/types/audit-log.types.ts
import { AuditAction } from './enums';
import { BaseQueryParams } from './common.types';
import { User } from './user.types';

export interface AuditLog {
  id: number;
  userId?: string | null;
  action: AuditAction;
  entityName: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | string;
  newValue?: Record<string, unknown> | string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User | null;
}

export interface AuditLogQueryParams extends BaseQueryParams {
  userId?: string;
  action?: AuditAction;
  entityName?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateAuditLogDto {
  action: AuditAction;
  entityName: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}
