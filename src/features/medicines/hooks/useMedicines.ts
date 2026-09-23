// src/features/medicines/hooks/useMedicines.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { medicinesApi } from '@/api/endpoints/medicines.api';
import { notifyApiFeedback } from '@/api/axios';
import { Medicine, CreateMedicineDto, UpdateMedicineDto, MedicineQueryParams } from '@/types';

export function useMedicines(params?: MedicineQueryParams) {
  return useQuery({
    queryKey: queryKeys.medicines.list(params || {}),
    queryFn: () => medicinesApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMedicineDto) => medicinesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all });
      notifyApiFeedback('Thêm thuốc mới thành công', 'info');
    },
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMedicineDto }) =>
      medicinesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all });
      notifyApiFeedback('Cập nhật thông tin thuốc thành công', 'info');
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicinesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all });
      notifyApiFeedback('Đã xóa thuốc khỏi danh mục', 'info');
    },
  });
}
