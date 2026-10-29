// src/features/medicines/hooks/useMedicines.ts
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { medicinesApi } from "@/api/endpoints/medicines.api";
import { notifyApiFeedback } from "@/api/axios";
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  MedicineQueryParams,
} from "@/types";

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
    onSuccess: (response) => {
      const created = response;
      queryClient.setQueriesData(
        { queryKey: queryKeys.medicines.lists() },
        (cached: any) => {
          if (!cached || !Array.isArray(cached.data)) return cached;
          if (
            cached.data.some((item: Medicine) => item.id === created.id) ||
            cached.pagination?.page !== 1
          )
            return cached;
          return {
            ...cached,
            data: [created, ...cached.data].slice(
              0,
              cached.pagination?.limit ?? cached.data.length + 1,
            ),
            pagination: cached.pagination
              ? { ...cached.pagination, total: cached.pagination.total + 1 }
              : cached.pagination,
          };
        },
      );
      notifyApiFeedback("Thêm thuốc mới thành công", "info");
    },
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMedicineDto }) =>
      medicinesApi.update(id, dto),
    onSuccess: (response, variables) => {
      const updated = response;
      queryClient.setQueryData(
        queryKeys.medicines.detail(variables.id),
        updated,
      );
      queryClient.setQueriesData(
        { queryKey: queryKeys.medicines.lists() },
        (cached: any) =>
          cached && Array.isArray(cached.data)
            ? {
                ...cached,
                data: cached.data.map((item: Medicine) =>
                  item.id === updated.id ? updated : item,
                ),
              }
            : cached,
      );
      notifyApiFeedback("Cập nhật thông tin thuốc thành công", "info");
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicinesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.medicines.detail(id) });
      queryClient.setQueriesData(
        { queryKey: queryKeys.medicines.lists() },
        (cached: any) => {
          if (!cached || !Array.isArray(cached.data)) return cached;
          const data = cached.data.filter((item: Medicine) => item.id !== id);
          return data.length === cached.data.length
            ? cached
            : {
                ...cached,
                data,
                pagination: cached.pagination
                  ? {
                      ...cached.pagination,
                      total: Math.max(0, cached.pagination.total - 1),
                    }
                  : cached.pagination,
              };
        },
      );
      notifyApiFeedback("Đã xóa thuốc khỏi danh mục", "info");
    },
  });
}

export function useMedicinesDropdown(limit = 100) {
  return useQuery({
    queryKey: queryKeys.medicines.list({ limit }),
    queryFn: () => medicinesApi.findAll({ limit }),
    staleTime: 5 * 60_000,
  });
}

export function useMedicinesAll() {
  return useQuery({
    queryKey: queryKeys.medicines.all,
    queryFn: async () => {
      const response = await medicinesApi.findAll({ page: 1, limit: 1000 });
      return response.data;
    },
    staleTime: 5 * 60_000,
  });
}
