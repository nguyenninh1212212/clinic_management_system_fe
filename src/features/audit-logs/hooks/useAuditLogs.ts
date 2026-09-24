// src/features/audit-logs/hooks/useAuditLogs.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { auditLogsApi } from '@/api/endpoints/audit-logs.api';
import { AuditAction, AuditLogQueryParams } from '@/types';



export function useAuditLogs(params: AuditLogQueryParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list({
      page: params.page,
      limit: params.limit,
      action: params.action || undefined,
      entityName: params.entityName || undefined,
      search: params.search || undefined,
    }),
    queryFn: () =>
      auditLogsApi.findAll({
        page: params.page,
        limit: params.limit,
        action: params.action || undefined,
        entityName: params.entityName || undefined,
        search: params.search || undefined,
      }),
    staleTime: 30_000,
  });
}
