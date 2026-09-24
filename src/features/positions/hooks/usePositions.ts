// src/features/positions/hooks/usePositions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { positionsApi } from '@/api/endpoints/positions.api';
import { notifyApiFeedback } from '@/api/axios';
import { CreatePositionDto, UpdatePositionDto, PositionLevel } from '@/types';

interface UsePositionListParams {
  page: number;
  limit: number;
  search?: string;
  level?: PositionLevel;
}

export function usePositionList(params: UsePositionListParams) {
  return useQuery({
    queryKey: queryKeys.positions.list({
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      level: params.level || undefined,
    }),
    queryFn: () =>
      positionsApi.findAll({
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        level: params.level || undefined,
      }),
    staleTime: 60_000,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePositionDto) => positionsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      notifyApiFeedback('Thêm vị trí công việc thành công', 'info');
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePositionDto }) =>
      positionsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      notifyApiFeedback('Cập nhật vị trí thành công', 'info');
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionsApi.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      notifyApiFeedback('Đã xóa vị trí công tác', 'info');
    },
  });
}
