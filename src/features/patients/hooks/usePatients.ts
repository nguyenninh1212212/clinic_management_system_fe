// src/features/patients/hooks/usePatients.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { patientsApi } from '@/api/endpoints/patients.api';
import { notifyApiFeedback } from '@/api/axios';
import type { Patient, CreatePatientDto, UpdatePatientDto, PatientQueryParams } from '@/types';

export function usePatients(params: PatientQueryParams) {
  return useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: () => patientsApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function usePatient(id: string) {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      notifyApiFeedback('Cập nhật hồ sơ bệnh nhân thành công', 'info');
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsApi.remove(id),
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.patients.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      notifyApiFeedback('Đã xóa hồ sơ bệnh nhân', 'info');
    },
  });
}
