// src/api/endpoints/appointments.api.ts
import { api } from '@/api/axios';
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentQueryParams,
  PaginatedResponse,
} from '@/types';

export const appointmentsApi = {
  findAll: (params?: AppointmentQueryParams): Promise<PaginatedResponse<Appointment>> =>
    api.get('/appointments', { params }).then((r) => r.data),

  findById: (id: string): Promise<Appointment> =>
    api.get(`/appointments/${id}`).then((r) => r.data),

  create: (dto: CreateAppointmentDto): Promise<Appointment> =>
    api.post('/appointments', dto).then((r) => r.data),

  update: (id: string, dto: UpdateAppointmentDto): Promise<Appointment> =>
    api.patch(`/appointments/${id}`, dto).then((r) => r.data),

  updateStatus: (id: string, dto: UpdateAppointmentStatusDto): Promise<Appointment> =>
    api.patch(`/appointments/${id}/status`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/appointments/${id}`).then((r) => r.data),
};
