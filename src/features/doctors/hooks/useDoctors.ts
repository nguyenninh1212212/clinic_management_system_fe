// src/features/doctors/hooks/useDoctors.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { doctorsApi } from '@/api/endpoints/doctors.api';
import { notifyApiFeedback } from '@/api/axios';
import type { Doctor, CreateDoctorDto, UpdateDoctorDto, DoctorQueryParams } from '@/types';

export function useDoctors(params?: DoctorQueryParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params || {}),
    queryFn: () => doctorsApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: () => doctorsApi.findById(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDoctorDto) => doctorsApi.create(dto),
    onSuccess: (created: Doctor) => {
      queryClient.setQueryData(queryKeys.doctors.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.lists() });
      notifyApiFeedback('Tạo hồ sơ bác sĩ thành công', 'info');
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDoctorDto }) =>
      doctorsApi.update(id, dto),
    onSuccess: (updated: Doctor) => {
      queryClient.setQueryData(queryKeys.doctors.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.lists() });
      notifyApiFeedback('Cập nhật hồ sơ bác sĩ thành công', 'info');
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => doctorsApi.remove(id),
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.doctors.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.lists() });
      notifyApiFeedback('Đã xóa hồ sơ bác sĩ', 'info');
    },
  });
}
