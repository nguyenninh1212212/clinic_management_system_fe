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

export interface NotificationQueryParams extends BaseQueryParams {}
