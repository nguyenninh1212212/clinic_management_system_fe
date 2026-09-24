// src/features/triage/hooks/useTriageList.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { triageResultsApi } from '@/api/endpoints/triage-results.api';
import { notifyApiFeedback } from '@/api/axios';
import { TriageLevel, CreateTriageResultDto, UpdateTriageResultDto } from '@/types';

interface UseTriageListParams {
  page: number;
  limit: number;
  triageLevel?: TriageLevel;
}

export function useTriageList(params: UseTriageListParams) {
  return useQuery({
    queryKey: queryKeys.triageResults.list({
      page: params.page,
      limit: params.limit,
      triageLevel: params.triageLevel || undefined,
    }),
    queryFn: () =>
      triageResultsApi.findAll({
        page: params.page,
        limit: params.limit,
        triageLevel: params.triageLevel || undefined,
      }),
    staleTime: 30_000,
  });
}

export function useUpsertTriage(appointmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id?: number; dto: CreateTriageResultDto | UpdateTriageResultDto }) =>
      id
        ? triageResultsApi.update(id, dto as UpdateTriageResultDto)
        : triageResultsApi.create(dto as CreateTriageResultDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(appointmentId) });
      notifyApiFeedback('Lưu sinh hiệu thành công', 'info');
    },
  });
}
