
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/api/axios';

export interface SocketConnectionOptions {
  namespace?: string;
  token: string;
}

let sharedSocket: Socket | null = null;
let currentNamespace = '';
let currentToken='';

export const connectSocket = ({
  namespace = '',
  token,
}: SocketConnectionOptions): Socket => {
  const normalizedNamespace = namespace
    ? namespace.startsWith('/')
      ? namespace
      : `/${namespace}`
    : '';

  // Tái sử dụng kết nối nếu cùng namespace.
  if (
    sharedSocket &&
    currentNamespace === normalizedNamespace && currentToken===token
  ) {
    sharedSocket.auth = { token };

    if (!sharedSocket.connected) {
      sharedSocket.connect();
    }

    return sharedSocket;
  }

  // Chỉ đóng socket cũ khi thực sự đổi namespace.
  sharedSocket?.disconnect();

  currentNamespace = normalizedNamespace;
  currentToken=token;

  const url = `${new URL(API_BASE_URL || '/api/v1', window.location.origin).origin}${normalizedNamespace}`;

  sharedSocket = io(url, {
    autoConnect: false,
    auth: { token },
    withCredentials: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  sharedSocket.connect();

  return sharedSocket;
};

export const getSharedSocket = (): Socket | null => {
  return sharedSocket;
};

export const disconnectSocket = (): void => {
  sharedSocket?.disconnect();
  sharedSocket = null;
  currentNamespace = '';
  currentToken='';
};
