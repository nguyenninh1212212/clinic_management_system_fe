// src/features/permissions/hooks/usePermissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { permissionsApi } from '@/api/endpoints/permissions.api';
import { notifyApiFeedback } from '@/api/axios';
import { CreatePermissionDto, PermissionQueryParams } from '@/types';

export function usePermissionList(params?: PermissionQueryParams) {
  return useQuery({
    queryKey: queryKeys.permissions.list(params || {}),
    queryFn: () => permissionsApi.findAll(params),
    staleTime: 60_000,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePermissionDto) => permissionsApi.create(dto),
    onSuccess: (created) => {
      queryClient.setQueriesData({ queryKey: queryKeys.permissions.all }, (cached: any) => Array.isArray(cached) ? [created, ...cached.filter((item: any) => item.id !== created.id)] : cached);
      notifyApiFeedback('Thêm quyền truy cập thành công', 'info');
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CreatePermissionDto }) =>
      permissionsApi.update(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueriesData({ queryKey: queryKeys.permissions.all }, (cached: any) => Array.isArray(cached) ? cached.map((item: any) => item.id === updated.id ? updated : item) : cached);
      notifyApiFeedback('Cập nhật quyền thành công', 'info');
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData({ queryKey: queryKeys.permissions.all }, (cached: any) => Array.isArray(cached) ? cached.filter((item: any) => item.id !== id) : cached);
      notifyApiFeedback('Đã xóa quyền truy cập', 'info');
    },
  });
}
