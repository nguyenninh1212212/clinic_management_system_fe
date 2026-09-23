// src/api/endpoints/notifications.api.ts
import { api } from '@/api/axios';
import {
  Notification,
  NotificationQueryParams,
  PaginatedResponse,
} from '@/types';

export const notificationsApi = {
  findAll: (params?: NotificationQueryParams): Promise<PaginatedResponse<Notification>> =>
    api.get('/notifications', { params }).then((r) => r.data),

  markRead: (id: number): Promise<void> =>
    api.put(`/notifications/${id}/read`).then((r) => r.data),
};
