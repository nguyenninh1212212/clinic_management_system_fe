
import { Socket } from 'socket.io-client';
import { connectSocket } from '@/services/socketService';

import {
  PharmacyPrescriptionCreatedPayload,
  PharmacyPrescriptionUpdatedPayload,
} from '@/types';

export interface PharmacySocketHandlers {
  onCreated: (
    payload: PharmacyPrescriptionCreatedPayload,
  ) => void;

  onUpdated: (
    payload: PharmacyPrescriptionUpdatedPayload,
  ) => void;

  onReconnect: () => void;

  onStatus: (
    status: 'connecting' | 'connected' | 'disconnected',
  ) => void;
}

export const createPharmacySocket = (
  token: string,
  handlers: PharmacySocketHandlers,
): Socket => {
  const socket = connectSocket({ token });

  handlers.onStatus(
    socket.connected ? 'connected' : 'connecting',
  );

  const handleConnect = () => {
    socket.emit('subscribe', { event: 'pharmacy' });

    handlers.onStatus('connected');

    if (socket.recovered) {
      handlers.onReconnect();
    }
  };

  const handleDisconnect = () => {
    handlers.onStatus('disconnected');
  };

  const handleCreated = (
    payload: PharmacyPrescriptionCreatedPayload,
  ) => handlers.onCreated(payload);

  const handleUpdated = (
    payload: PharmacyPrescriptionUpdatedPayload,
  ) => handlers.onUpdated(payload);

  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('prescription.created', handleCreated);
  socket.on('prescription.updated', handleUpdated);

  return socket;
};
