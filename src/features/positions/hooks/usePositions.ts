// src/features/positions/hooks/usePositions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { positionsApi } from '@/api/endpoints/positions.api';
import { notifyApiFeedback } from '@/api/axios';
import { CreatePositionDto, UpdatePositionDto, PositionQueryParams } from '@/types';

interface UsePositionListParams extends PositionQueryParams {
  page: number;
  limit: number;
}

export function usePositionList(params: UsePositionListParams) {
  return useQuery({
    queryKey: queryKeys.positions.list(params),
    queryFn: () => positionsApi.findAll(params),
    staleTime: 60_000,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePositionDto) => positionsApi.create(dto),
    onSuccess: (created) => {
      queryClient.setQueriesData({ queryKey: queryKeys.positions.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        if (cached.data.some((item: any) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      queryClient.setQueriesData({ queryKey: queryKeys.positions.all }, (cached: any) => Array.isArray(cached) ? [created, ...cached.filter((item: any) => item.id !== created.id)] : cached);
      notifyApiFeedback('Thêm vị trí công việc thành công', 'info');
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePositionDto }) =>
      positionsApi.update(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.positions.detail(updated.id), updated);
      queryClient.setQueriesData({ queryKey: queryKeys.positions.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.map((item: any) => item.id === updated.id ? updated : item) } : cached);
      queryClient.setQueriesData({ queryKey: queryKeys.positions.all }, (cached: any) => Array.isArray(cached) ? cached.map((item: any) => item.id === updated.id ? updated : item) : cached);
      notifyApiFeedback('Cập nhật vị trí thành công', 'info');
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionsApi.softDelete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.positions.detail(id) });
      queryClient.setQueriesData({ queryKey: queryKeys.positions.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.filter((item: any) => item.id !== id), pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination } : cached);
      queryClient.setQueriesData({ queryKey: queryKeys.positions.all }, (cached: any) => Array.isArray(cached) ? cached.filter((item: any) => item.id !== id) : cached);
      notifyApiFeedback('Đã xóa vị trí công tác', 'info');
    },
  });
}
