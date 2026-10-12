import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';

interface BookingStatusPayload {
  appointment?: {
    id?: string | number;
    doctorId?: string | number;
    appointmentDate?: string;
    status?: string;
  };
  status?: string;
  message?: string;
}

export function useAppointmentSocket(socket: Socket | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      console.warn('[Socket] Chưa có socket instance');
      return;
    }

    const handleBookingStatus = (payload: BookingStatusPayload) => {
      console.log(
        '[Socket] ĐÃ NHẬN appointment:booking-status:',
        payload,
      );

      void queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });
    };

    socket.on('appointment:booking-status', handleBookingStatus);

    console.log(
      '[Socket] Đã đăng ký listener appointment:booking-status',
    );

    return () => {
      socket.off('appointment:booking-status', handleBookingStatus);
    };
  }, [socket, queryClient]);
}