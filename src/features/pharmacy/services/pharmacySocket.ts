import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/api/axios';
import {
  PharmacyPrescriptionCreatedPayload,
  PharmacyPrescriptionUpdatedPayload,
} from '@/types';

export interface PharmacySocketHandlers {
  onCreated: (payload: PharmacyPrescriptionCreatedPayload) => void;
  onUpdated: (payload: PharmacyPrescriptionUpdatedPayload) => void;
  onReconnect: () => void;
  onStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

export const createPharmacySocket = (token: string, handlers: PharmacySocketHandlers): Socket => {
  const socket = io(`${API_BASE_URL}/notifications`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  handlers.onStatus('connecting');
  socket.on('connect', () => {
    socket.emit('subscribe', { event: 'pharmacy' });
    handlers.onStatus('connected');
  });
  socket.on('disconnect', () => handlers.onStatus('disconnected'));
  socket.io.on('reconnect_attempt', () => handlers.onStatus('connecting'));
  socket.io.on('reconnect', () => handlers.onReconnect());
  socket.on('prescription.created', handlers.onCreated);
  socket.on('prescription.updated', handlers.onUpdated);

  return socket;
};