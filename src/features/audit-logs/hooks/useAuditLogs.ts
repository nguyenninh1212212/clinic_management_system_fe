// src/features/audit-logs/hooks/useAuditLogs.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { auditLogsApi } from '@/api/endpoints/audit-logs.api';
import { AuditAction, AuditLogQueryParams } from '@/types';



export function useAuditLogs(params: AuditLogQueryParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => auditLogsApi.findAll(params),
    staleTime: 30_000,
  });
}
