// src/features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { notificationsApi } from '@/api/endpoints/notifications.api';
import { notifyApiFeedback } from '@/api/axios';

export function useNotifications(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: queryKeys.notifications.list({ page: params.page, limit: params.limit }),
    queryFn: () => notificationsApi.findAll({ page: params.page, limit: params.limit }),
    staleTime: 10_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notifyApiFeedback('Đã xóa thông báo', 'info');
    },
  });
}
