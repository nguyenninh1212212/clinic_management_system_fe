// src/features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { notificationsApi } from '@/api/endpoints/notifications.api';
import { notifyApiFeedback } from '@/api/axios';
import { CreateNotificationDto, NotificationQueryParams } from '@/types';

export function useNotifications(params: NotificationQueryParams & { page: number; limit: number }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsApi.findAll(params),
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
    mutationFn: (ids: number[]) => notificationsApi.removeBulk(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notifyApiFeedback('Đã xóa thông báo', 'info');
    },
  });
}
