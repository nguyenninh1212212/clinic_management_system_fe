// src/features/triage/hooks/useTriageList.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { triageResultsApi } from "@/api/endpoints/triage-results.api";
import { notifyApiFeedback } from "@/api/axios";
import {
  TriageResultQueryParams,
  CreateTriageResultDto,
  UpdateTriageResultDto,
} from "@/types";

interface UseTriageListParams extends TriageResultQueryParams {
  page: number;
  limit: number;
}

export function useTriageList(params: UseTriageListParams) {
  return useQuery({
    queryKey: queryKeys.triageResults.list(params),
    queryFn: () => triageResultsApi.findAll(params),
    staleTime: 30_000,
  });
}

export function useUpsertTriage(appointmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id?: number;
      dto: CreateTriageResultDto | UpdateTriageResultDto;
    }) =>
      id
        ? triageResultsApi.update(id, dto as UpdateTriageResultDto)
        : triageResultsApi.create(dto as CreateTriageResultDto),
    onSuccess: (response) => {
      const triage = response;
      console.log("🚀 ~ useUpsertTriage ~ triage:", triage)
      queryClient.setQueryData(
        queryKeys.appointments.detail(appointmentId),
        (cached: any) =>
          cached ? { ...cached, triageResult: triage } : cached,
      );
      notifyApiFeedback("Lưu sinh hiệu thành công", "info");
    },
  });
}
