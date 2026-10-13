// src/api/endpoints/appointments.api.ts
import { api } from '@/api/axios';
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentQueryParams,
  PaginatedResponse,
  ApiResponse,
  AppointmentCharts,
  ChartDateQuery,
} from '@/types';

export const appointmentsApi = {
  getCharts: (params?: ChartDateQuery): Promise<ApiResponse<AppointmentCharts>> =>
    api.get('/appointments/charts', { params }).then((r) => r.data),
  findAll: (params?: AppointmentQueryParams): Promise<PaginatedResponse<Appointment>> =>
    api.get('/appointments', { params }).then((r) => r.data),

  findById: (id: string): Promise<Appointment> =>
    api.get(`/appointments/${id}`).then((r) => r.data.data),

  create: (dto: CreateAppointmentDto): Promise<Appointment> =>
    api.post('/appointments', dto).then((r) => r.data.message),

  update: (id: string, dto: UpdateAppointmentDto): Promise<ApiResponse<Appointment>> =>
    api.patch(`/appointments/${id}`, dto).then((r) => r.data),

  updateStatus: (id: string, dto: UpdateAppointmentStatusDto): Promise<Appointment> =>
    api.patch(`/appointments/${id}/status`, dto).then((r) => r.data.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/appointments/${id}`).then((r) => r.data),
};
