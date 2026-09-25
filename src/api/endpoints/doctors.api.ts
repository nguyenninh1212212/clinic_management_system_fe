// src/api/endpoints/doctors.api.ts
import { api } from '@/api/axios';
import {
  Doctor,
  CreateDoctorDto,
  UpdateDoctorDto,
  DoctorQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const doctorsApi = {
  findAll: (params?: DoctorQueryParams): Promise<PaginatedResponse<Doctor>> =>
    api.get('/doctors', { params }).then((r) => r.data),

  findMe: (): Promise<ApiResponse<Doctor>> =>
    api.get('/doctors/me').then((r) => r.data),

  findById: (id: string): Promise<ApiResponse<Doctor>> =>
    api.get(`/doctors/${id}`).then((r) => r.data),

  create: (dto: CreateDoctorDto): Promise<Doctor> =>
     api.post('/doctors', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdateDoctorDto): Promise<Doctor> =>
    api.put(`/doctors/${id}`, dto).then((r) => r.data.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/doctors/${id}`).then((r) => r.data),
};
