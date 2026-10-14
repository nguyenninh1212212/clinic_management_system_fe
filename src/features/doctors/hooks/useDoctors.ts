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
      queryClient.setQueriesData({ queryKey: queryKeys.doctors.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        if (cached.data.some((item: Doctor) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.doctors.lists(), type: 'all' });
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
      queryClient.setQueriesData({ queryKey: queryKeys.doctors.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        return { ...cached, data: cached.data.map((item: Doctor) => item.id === updated.id ? updated : item) };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.doctors.lists(), type: 'all' });
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
      queryClient.setQueriesData({ queryKey: queryKeys.doctors.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: Doctor) => item.id !== id);
        return data.length === cached.data.length ? cached : { ...cached, data, pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.doctors.lists(), type: 'all' });
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

