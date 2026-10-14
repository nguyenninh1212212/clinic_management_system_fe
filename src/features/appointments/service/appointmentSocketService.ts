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

      const appointment = payload.appointment;
      if (!appointment?.id) return;
      queryClient.setQueriesData({ queryKey: ['appointments'] }, (cached: any) => {
        const patch = (item: any) => item.id === appointment.id ? { ...item, ...appointment, status: appointment.status ?? payload.status ?? item.status } : item;
        if (Array.isArray(cached?.data)) return { ...cached, data: cached.data.map(patch) };
        if (cached && typeof cached === 'object' && cached.id != null) return patch(cached);
        return cached;
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
