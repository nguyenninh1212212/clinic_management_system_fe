// src/api/endpoints/audit-logs.api.ts
import { api } from '@/api/axios';
import {
  AuditLog,
  CreateAuditLogDto,
  AuditLogQueryParams,
  PaginatedResponse,
} from '@/types';

export const auditLogsApi = {
  findAll: (params?: AuditLogQueryParams): Promise<PaginatedResponse<AuditLog>> =>
    api.get('/audit-logs', { params }).then((r) => r.data),

  create: (dto: CreateAuditLogDto): Promise<AuditLog> =>
    api.post('/audit-logs', dto).then((r) => r.data),
};
