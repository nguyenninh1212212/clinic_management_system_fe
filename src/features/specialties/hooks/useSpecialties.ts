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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.specialties.all });
      notifyApiFeedback('Thêm chuyên khoa thành công', 'info');
    },
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSpecialtyDto }) =>
      specialtiesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.specialties.all });
      notifyApiFeedback('Cập nhật chuyên khoa thành công', 'info');
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => specialtiesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.specialties.all });
      notifyApiFeedback('Đã xóa chuyên khoa', 'info');
    },
  });
}
