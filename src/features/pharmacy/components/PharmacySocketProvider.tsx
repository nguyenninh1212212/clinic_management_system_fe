import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from '@/api/queryKeys';
import {
  PharmacyPrescriptionCreatedPayload,
  PharmacyPrescriptionUpdatedPayload,
  PharmacySocketStatus,
} from '@/types';
import { createPharmacySocket } from '../services/pharmacySocket';

interface PharmacySocketContextValue {
  status: PharmacySocketStatus;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

interface PharmacySocketProviderProps {
  children: React.ReactNode;
  onCreated: (payload: PharmacyPrescriptionCreatedPayload) => void;
  onUpdated: (payload: PharmacyPrescriptionUpdatedPayload) => void;
}

const PharmacySocketContext = createContext<PharmacySocketContextValue | null>(null);

export const PharmacySocketProvider: React.FC<PharmacySocketProviderProps> = ({ children, onCreated, onUpdated }) => {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PharmacySocketStatus>('disconnected');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const createdRef = useRef(onCreated);
  const updatedRef = useRef(onUpdated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => { createdRef.current = onCreated; }, [onCreated]);
  useEffect(() => { updatedRef.current = onUpdated; }, [onUpdated]);

  useEffect(() => {
    if (!token) {
      setStatus('disconnected');
      return undefined;
    }

    const socket = createPharmacySocket(token, {
      onCreated: (payload) => createdRef.current(payload),
      onUpdated: (payload) => updatedRef.current(payload),
      onStatus: setStatus,
      onReconnect: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.all });
      },
    });
    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, token]);

  const value = useMemo(() => ({ status, soundEnabled, setSoundEnabled }), [soundEnabled, status]);
  return <PharmacySocketContext.Provider value={value}>{children}</PharmacySocketContext.Provider>;
};

export const usePharmacySocket = () => {
  const context = useContext(PharmacySocketContext);
  if (!context) throw new Error('usePharmacySocket must be used inside PharmacySocketProvider');
  return context;
};