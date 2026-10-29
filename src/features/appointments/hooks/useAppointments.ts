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

export function useCreateAppointment(): UseMutationResult<Appointment, Error, CreateAppointmentDto, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => appointmentsApi.create(dto),
    onSuccess: (created: Appointment) => {
      queryClient.setQueryData(queryKeys.appointments.detail(created.id), created);
      queryClient.setQueriesData({ queryKey: queryKeys.appointments.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data) || cached.data.some((item: Appointment) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
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
      queryClient.setQueryData(queryKeys.appointments.detail(updated.data.id), updated.data);
      queryClient.setQueriesData({ queryKey: queryKeys.appointments.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.map((item: Appointment) => item.id === updated.data.id ? updated.data : item) } : cached);
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
    onSuccess: (updated: Appointment) => {
      queryClient.setQueryData(queryKeys.appointments.detail(updated.id), updated);
      queryClient.setQueriesData({ queryKey: queryKeys.appointments.lists() }, (cached: any) => cached && Array.isArray(cached.data) ? { ...cached, data: cached.data.map((item: Appointment) => item.id === updated.id ? updated : item) } : cached);
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
      queryClient.setQueriesData({ queryKey: queryKeys.appointments.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const data = cached.data.filter((item: Appointment) => item.id !== id);
        return data.length === cached.data.length ? cached : { ...cached, data, pagination: cached.pagination ? { ...cached.pagination, total: Math.max(0, cached.pagination.total - 1) } : cached.pagination };
      });
      notifyApiFeedback('Đã xóa cuộc hẹn', 'info');
    },
  });
}
