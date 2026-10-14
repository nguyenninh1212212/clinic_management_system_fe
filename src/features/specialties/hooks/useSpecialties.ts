// src/features/specialties/hooks/useSpecialties.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { specialtiesApi } from '@/api/endpoints/specialties.api';
import { notifyApiFeedback } from '@/api/axios';
import type { Specialty, CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyQueryParams } from '@/types';

export function useSpecialties(params?: SpecialtyQueryParams) {
  return useQuery({
    queryKey: queryKeys.specialties.list(params || {}),
    queryFn: () => specialtiesApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useSpecialtiesDropdown() {
  return useQuery({
    queryKey: queryKeys.specialties.dropdown(),
    queryFn: () => specialtiesApi.getAllDropdown(),
    staleTime: 10 * 60_000,
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSpecialtyDto) => specialtiesApi.create(dto),
    onSuccess: (response) => {
      const created = response.data;
      queryClient.setQueriesData({ queryKey: queryKeys.specialties.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data) || cached.data.some((item: Specialty) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      queryClient.setQueriesData({ queryKey: queryKeys.specialties.dropdown() }, (cached: any) => Array.isArray(cached) ? [created, ...cached.filter((item: Specialty) => item.id !== created.id)] : cached);
      void queryClient.refetchQueries({ queryKey: queryKeys.specialties.lists(), type: 'all' });
      void queryClient.refetchQueries({ queryKey: queryKeys.specialties.dropdown(), type: 'all' });
      notifyApiFeedback('Thêm chuyên khoa thành công', 'info');
    },
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSpecialtyDto }) =>
      specialtiesApi.update(id, dto),
    onSuccess: (response, variables) => {
      const updated = response.data;
      queryClient.setQueryData(queryKeys.specialties.detail(variables.id), response);
      queryClient.setQueriesData({ queryKey: queryKeys.specialties.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.map((item: Specialty) => item.id === updated.id ? updated : item) } : cached);
      queryClient.setQueriesData({ queryKey: queryKeys.specialties.dropdown() }, (cached: any) => Array.isArray(cached) ? cached.map((item: Specialty) => item.id === updated.id ? updated : item) : cached);
      void queryClient.refetchQueries({ queryKey: queryKeys.specialties.lists(), type: 'all' });
      void queryClient.refetchQueries({ queryKey: queryKeys.specialties.dropdown(), type: 'all' });
      notifyApiFeedback('Cập nhật chuyên khoa thành công', 'info');
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => specialtiesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.specialties.detail(id) });
      queryClient.setQueriesData({ queryKey: queryKeys.specialties.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.filter((item: Specialty) => item.id !== id), pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination } : cached);
      queryClient.setQueriesData({ queryKey: queryKeys.specialties.dropdown() }, (cached: any) => Array.isArray(cached) ? cached.filter((item: Specialty) => item.id !== id) : cached);
      void queryClient.refetchQueries({ queryKey: queryKeys.specialties.lists(), type: 'all' });
      void queryClient.refetchQueries({ queryKey: queryKeys.specialties.dropdown(), type: 'all' });
      notifyApiFeedback('Đã xóa chuyên khoa', 'info');
    },
  });
}
