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
    onSuccess: (_data, id) => {
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.map((item: any) => item.id === id ? { ...item, isRead: true } : item) } : cached);
      void queryClient.refetchQueries({ queryKey: queryKeys.notifications.all, type: 'all' });
    },
  });
}



export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => notificationsApi.removeBulk(ids),
    onSuccess: (_data, ids) => {
      const removed = new Set(ids);
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: any) => !removed.has(item.id));
        return { ...cached, data, pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - (cached.data.length - data.length)) } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.notifications.all, type: 'all' });
      notifyApiFeedback('Đã xóa thông báo', 'info');
    },
  });
}
