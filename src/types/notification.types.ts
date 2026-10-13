// src/types/notification.types.ts
import { BaseQueryParams } from './common.types';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}

export interface NotificationQueryParams extends BaseQueryParams {
  isRead?: boolean;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
