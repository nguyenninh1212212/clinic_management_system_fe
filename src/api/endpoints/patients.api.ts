// src/api/endpoints/patients.api.ts
import { api } from '@/api/axios';
import {
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const patientsApi = {
  findAll: (params?: PatientQueryParams): Promise<PaginatedResponse<Patient>> =>
    api.get('/patients', { params }).then((r) => r.data),

  findById: (id: string): Promise<Patient> =>
    api.get(`/patients/${id}`).then((r) => r.data.data),

  create: (dto: CreatePatientDto): Promise<Patient> =>
    api.post('/patients', dto).then((r) => r.data.data),

  update: (id: string, dto: UpdatePatientDto): Promise<Patient> =>
    api.put(`/patients/${id}`, dto).then((r) => r.data.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/patients/${id}`).then((r) => r.data),
};
