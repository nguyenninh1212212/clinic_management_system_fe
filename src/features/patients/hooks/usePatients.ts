// src/features/patients/hooks/usePatients.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { patientsApi } from '@/api/endpoints/patients.api';
import { notifyApiFeedback } from '@/api/axios';
import type { Patient, CreatePatientDto, UpdatePatientDto, PatientQueryParams, ApiResponse } from '@/types';

export function usePatients(params: PatientQueryParams) {
  return useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: () => patientsApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function usePatient(id: string): UseQueryResult<Patient> {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => patientsApi.findById(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePatientDto) => patientsApi.create(dto),
    onSuccess: (created: Patient) => {
      queryClient.setQueryData(queryKeys.patients.detail(created.id), created);
      queryClient.setQueriesData({ queryKey: queryKeys.patients.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        if (cached.data.some((item: Patient) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.patients.lists(), type: 'all' });
      notifyApiFeedback('Thêm bệnh nhân thành công', 'info');
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePatientDto }) =>
      patientsApi.update(id, dto),
    onSuccess: (updated: Patient) => {
      queryClient.setQueryData(queryKeys.patients.detail(updated.id), updated);
      queryClient.setQueriesData({ queryKey: queryKeys.patients.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        return { ...cached, data: cached.data.map((item: Patient) => item.id === updated.id ? updated : item) };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.patients.lists(), type: 'all' });
      notifyApiFeedback('Cập nhật hồ sơ bệnh nhân thành công', 'info');
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return patientsApi.remove(id);
    },
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.patients.detail(id) });
      queryClient.setQueriesData({ queryKey: queryKeys.patients.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: Patient) => item.id !== id);
        return data.length === cached.data.length ? cached : { ...cached, data, pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.patients.lists(), type: 'all' });
      notifyApiFeedback('Đã xóa hồ sơ bệnh nhân', 'info');
    },
  });
}
