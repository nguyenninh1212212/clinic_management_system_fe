// src/features/inventory/hooks/useInventory.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { inventoryApi } from '@/api/endpoints/inventory.api';
import { stockTransactionsApi } from '@/api/endpoints/stock-transactions.api';
import { notifyApiFeedback } from '@/api/axios';
import {
  CreateInventoryDto,
  CreateStockTransactionDto,
  InventoryQueryParams,
  StockTransactionQueryParams,
  StockTransactionType,
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
    mutationFn: (dto: CreateInventoryDto) => inventoryApi.create(dto),
    onSuccess: (response) => {
      const created = response.data;
      queryClient.setQueryData(queryKeys.inventory.detail(created.id), created);
      queryClient.setQueriesData({ queryKey: queryKeys.inventory.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const alreadyPresent = cached.data.some((item: any) => item.id === created.id);
        if (alreadyPresent || cached.pagination?.page !== 1) return cached;
        return {
          ...cached,
          data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1),
          pagination: cached.pagination
            ? { ...cached.pagination, total: cached.pagination.total + 1 }
            : cached.pagination,
        };
      });
      notifyApiFeedback('Thêm lô thuốc mới vào kho thành công', 'info');
    },
  });
}

export function useStockTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStockTransactionDto) => stockTransactionsApi.create(dto),
    onSuccess: (response) => {
      const transaction = response;
      queryClient.setQueriesData({ queryKey: queryKeys.stockTransactions.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        if (cached.data.some((item: any) => item.id === transaction.id)) return cached;
        if (cached.pagination?.page !== 1) return cached;
        return {
          ...cached,
          data: [transaction, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1),
          pagination: cached.pagination
            ? { ...cached.pagination, total: cached.pagination.total + 1 }
            : cached.pagination,
        };
      });
      queryClient.setQueryData(queryKeys.inventory.detail(transaction.inventoryId), (cached: any) =>
        cached ? {
          ...cached,
          quantity: transaction.balanceAfter ?? cached.quantity,
          transactions: cached.transactions
            ? [transaction, ...cached.transactions.filter((item: any) => item.id !== transaction.id)]
            : cached.transactions,
        } : cached,
      );
      const defaultListParams: StockTransactionQueryParams = { page: 1, limit: 15 };
      const defaultListKey = queryKeys.stockTransactions.list(defaultListParams);
      if (!queryClient.getQueryState(defaultListKey)) {
        void stockTransactionsApi.findAll(defaultListParams).then((freshData) => {
          queryClient.setQueryData(defaultListKey, freshData);
        }).catch(() => undefined);
      }
      notifyApiFeedback('Ghi nhận giao dịch kho thành công', 'info');
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.inventory.detail(id) });
      queryClient.setQueriesData({ queryKey: queryKeys.inventory.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: any) => item.id !== id);
        if (data.length === cached.data.length) return cached;
        return {
          ...cached,
          data,
          pagination: cached.pagination
            ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) }
            : cached.pagination,
        };
      });
      notifyApiFeedback('Đã xóa lô thuốc khỏi kho', 'info');
    },
  });
}

export function useStockTransactionList(params: StockTransactionQueryParams) {
  return useQuery({
    queryKey: queryKeys.stockTransactions.list(params),
    queryFn: () => stockTransactionsApi.findAll(params),
    staleTime: 30_000,
  });
}
