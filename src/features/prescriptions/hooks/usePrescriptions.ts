// src/features/prescriptions/hooks/usePrescriptions.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { notifyApiFeedback } from '@/api/axios';
import { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto, PrescriptionQueryParams } from '@/types';

export function usePrescriptions(params?: PrescriptionQueryParams) {
  return useQuery({
    queryKey: queryKeys.prescriptions.list(params || {}),
    queryFn: () => prescriptionsApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePrescription(id: string) {
  return useQuery({
    queryKey: queryKeys.prescriptions.detail(id),
    queryFn: () => prescriptionsApi.findById(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePrescriptionDto) => prescriptionsApi.create(dto),
    onSuccess: (created: Prescription) => {
      queryClient.setQueryData(queryKeys.prescriptions.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.examinations.all });
      notifyApiFeedback('Kê đơn thuốc thành công', 'info');
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => prescriptionsApi.remove(id),
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.prescriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.lists() });
      notifyApiFeedback('Đã xóa đơn thuốc', 'info');
    },
  });
}
