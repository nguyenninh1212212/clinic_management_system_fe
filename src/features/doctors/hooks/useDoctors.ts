// src/features/doctors/hooks/useDoctors.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { doctorsApi } from '@/api/endpoints/doctors.api';
import { notifyApiFeedback } from '@/api/axios';
import type { Doctor, CreateDoctorDto, UpdateDoctorDto, DoctorQueryParams } from '@/types';

export function useDoctors(params?: DoctorQueryParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params || {}),
    queryFn: () => doctorsApi.findAll(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useDoctor(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: () => doctorsApi.findById(id),
    enabled: !!id && enabled,
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


export function useInfiniteDoctors(
  search?: string,
  specialtyId?: number,
) {
  return useInfiniteQuery({
    queryKey: ["doctors", "infinite", search, specialtyId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      doctorsApi.findAll({
        page: pageParam,
        limit: 5,
        search,
        specialtyId,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });
}

