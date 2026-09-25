// src/features/appointments/hooks/useAppointments.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { appointmentsApi } from '@/api/endpoints/appointments.api';
import { notifyApiFeedback } from '@/api/axios';
import { Appointment, AppointmentStatus, AppointmentQueryParams, CreateAppointmentDto, UpdateAppointmentDto, ApiResponse } from '@/types';

export function useAppointments(params?: AppointmentQueryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.appointments.list(params || {}),
    queryFn: () => appointmentsApi.findAll(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => appointmentsApi.findById(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreateAppointment(): UseMutationResult<ApiResponse<Appointment>, Error, CreateAppointmentDto, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => appointmentsApi.create(dto),
    onSuccess: (created: ApiResponse<Appointment>) => {
      queryClient.setQueryData(queryKeys.appointments.detail(created.data.id), created);
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      notifyApiFeedback('Tạo lịch hẹn thành công', 'info');
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAppointmentDto }) =>
      appointmentsApi.update(id, dto),
    onSuccess: (updated: ApiResponse<Appointment>) => {
      queryClient.setQueryData(queryKeys.appointments.detail(updated.data.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      notifyApiFeedback('Cập nhật cuộc hẹn thành công', 'info');
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: AppointmentStatus;
      notes?: string;
    }) => appointmentsApi.updateStatus(id, { status, notes }),
    onSuccess: (updated: ApiResponse<Appointment>) => {
      queryClient.setQueryData(queryKeys.appointments.detail(updated.data.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      notifyApiFeedback('Cập nhật trạng thái cuộc hẹn thành công', 'info');
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.remove(id),
    onSuccess: (_data, id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.appointments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      notifyApiFeedback('Đã xóa cuộc hẹn', 'info');
    },
  });
}
