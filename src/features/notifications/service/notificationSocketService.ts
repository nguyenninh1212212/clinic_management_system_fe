
import { connectSocket } from '@/services/socketService';
import type { Notification } from '@/types';

export type NotificationPayload = Partial<Notification> & {
  title?: string;
  message?: string;
  type?: string;
};

export function createNotificationSocket(
  token: string,
  onNotification: (payload: NotificationPayload) => void,
) {
  const socket = connectSocket({ token });

  socket.on('notification', onNotification);

  return socket;
}
