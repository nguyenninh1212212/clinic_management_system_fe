// src/features/inventory/hooks/useInventory.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { inventoryApi } from '@/api/endpoints/inventory.api';
import { notifyApiFeedback } from '@/api/axios';
import {
  InventoryItem,
  CreateInventoryItemDto,
  CreateStockTransactionDto,
  InventoryQueryParams,
} from '@/types';

export function useInventory(params?: InventoryQueryParams) {
  return useQuery({
    queryKey: queryKeys.inventory.list(params || {}),
    queryFn: () => inventoryApi.findAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInventoryItemDto) => inventoryApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      notifyApiFeedback('Thêm lô thuốc mới vào kho thành công', 'info');
    },
  });
}

export function useStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateStockTransactionDto) => inventoryApi.createTransaction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      notifyApiFeedback('Ghi nhận giao dịch kho thành công', 'info');
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      notifyApiFeedback('Đã xóa lô thuốc khỏi kho', 'info');
    },
  });
}
