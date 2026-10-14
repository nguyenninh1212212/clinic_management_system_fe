// src/features/prescriptions/hooks/usePrescriptions.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { notifyApiFeedback } from '@/api/axios';
import { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto, PrescriptionQueryParams, ApiResponse } from '@/types';

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
      queryClient.setQueriesData({ queryKey: queryKeys.prescriptions.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data) || cached.data.some((item: Prescription) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.prescriptions.lists(), type: 'all' });
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
      queryClient.setQueriesData({ queryKey: queryKeys.prescriptions.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: Prescription) => item.id !== id);
        return data.length === cached.data.length ? cached : { ...cached, data, pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.prescriptions.lists(), type: 'all' });
      notifyApiFeedback('Đã xóa đơn thuốc', 'info');
    },
  });
}
