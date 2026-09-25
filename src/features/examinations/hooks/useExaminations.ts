// src/features/examinations/hooks/useExaminations.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { examinationsApi } from '@/api/endpoints/examinations.api';
import { notifyApiFeedback } from '@/api/axios';
import { Examination, CreateExaminationDto, UpdateExaminationDto, ExaminationQueryParams, ApiResponse } from '@/types';

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
    onSuccess: (created: ApiResponse<Examination>) => {
      queryClient.setQueryData(queryKeys.examinations.detail(created.data.id), created);
      queryClient.invalidateQueries({ queryKey: queryKeys.examinations.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(created.data.appointmentId) });
      notifyApiFeedback('Tạo phiếu khám bệnh thành công', 'info');
    },
  });
}

export function useUpdateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExaminationDto }) =>
      examinationsApi.update(id, dto),
    onSuccess: (updated: ApiResponse<Examination>) => {
      queryClient.setQueryData(queryKeys.examinations.detail(updated.data.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.examinations.lists() });
      notifyApiFeedback('Cập nhật phiếu khám thành công', 'info');
    },
  });
}

export function useDeleteExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examinationsApi.remove(id),
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.examinations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.examinations.lists() });
      notifyApiFeedback('Đã xóa phiếu khám', 'info');
    },
  });
}
