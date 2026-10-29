// src/features/examinations/hooks/useExaminations.ts
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { examinationsApi } from "@/api/endpoints/examinations.api";
import { notifyApiFeedback } from "@/api/axios";
import {
  Examination,
  CreateExaminationDto,
  UpdateExaminationDto,
  ExaminationQueryParams,
  ApiResponse,
} from "@/types";

export function useExaminations(params?: ExaminationQueryParams) {
  return useQuery({
    queryKey: queryKeys.examinations.list(params || {}),
    queryFn: () => examinationsApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useExamination(id: string) {
  return useQuery({
    queryKey: queryKeys.examinations.detail(id),
    queryFn: () => examinationsApi.findById(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreateExamination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExaminationDto) => examinationsApi.create(dto),
    onSuccess: (created: Examination) => {
      queryClient.setQueryData(
        queryKeys.examinations.detail(created.id),
        created,
      );
      queryClient.setQueriesData({ queryKey: queryKeys.examinations.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data) || cached.data.some((item: Examination) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      queryClient.setQueryData(queryKeys.appointments.detail(created.appointmentId), (cached: any) => cached ? { ...cached, examination: created } : cached);
      notifyApiFeedback("Tạo phiếu khám bệnh thành công", "info");
    },
    onError: (err: any) => {
      notifyApiFeedback(
        err?.response?.data?.message ||
          "Có lỗi xảy ra khi tạo phiếu khám. Mỗi cuộc hẹn chỉ được liên kết 1 phiếu khám.",
        "error",
      );
    },
  });
}

export function useUpdateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExaminationDto }) =>
      examinationsApi.update(id, dto),
    onSuccess: (updated: ApiResponse<Examination>) => {
      queryClient.setQueryData(
        queryKeys.examinations.detail(updated.data.id),
        updated.data,
      );
      queryClient.setQueriesData({ queryKey: queryKeys.examinations.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.map((item: Examination) => item.id === updated.data.id ? updated.data : item) } : cached);
      notifyApiFeedback("Cập nhật phiếu khám thành công", "info");
    },
  });
}

export function useDeleteExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examinationsApi.remove(id),
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({
        queryKey: queryKeys.examinations.detail(id),
      });
      queryClient.setQueriesData({ queryKey: queryKeys.examinations.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: Examination) => item.id !== id);
        return data.length === cached.data.length ? cached : { ...cached, data, pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination };
      });
      notifyApiFeedback("Đã xóa phiếu khám", "info");
    },
  });
}
