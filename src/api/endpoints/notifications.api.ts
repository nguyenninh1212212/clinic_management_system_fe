// src/api/endpoints/notifications.api.ts
import { api } from "@/api/axios";
import {
  Notification,
  NotificationQueryParams,
  PaginatedResponse,
} from "@/types";

export const notificationsApi = {
  findAll: (
    params?: NotificationQueryParams,
  ): Promise<PaginatedResponse<Notification> & { unRead: number }> =>
    api
      .get<{
        notifications: Notification[];
        unRead: number;
        pagination: PaginatedResponse<Notification>["pagination"];
      }>("/notifications", { params })
      .then(({ data }) => ({
        data: data.notifications,
        pagination: data.pagination,
        unRead: data.unRead,
      })),

  markRead: (id: number): Promise<void> =>
    api.put(`/notifications/${id}/read`).then((r) => r.data),

  removeBulk: (ids: number[]): Promise<void> =>
    api
      .delete(`/notifications`, {
        data: ids,
      })
      .then((r) => r.data),
};
