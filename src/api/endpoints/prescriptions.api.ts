// src/api/endpoints/prescriptions.api.ts
import { api } from '@/api/axios';
import {
  Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionQueryParams,
  PaginatedResponse,
  ApiResponse,
  ChartDateQuery,
  PrescriptionCharts,
} from '@/types';

export const prescriptionsApi = {
  getCharts: (params?: ChartDateQuery): Promise<ApiResponse<PrescriptionCharts>> =>
    api.get('/prescriptions/charts', { params }).then((r) => r.data),
  findAll: (params?: PrescriptionQueryParams): Promise<PaginatedResponse<Prescription>> =>
    api.get('/prescriptions', { params }).then((r) => r.data),

  findByPatient: (id:string,params?: PrescriptionQueryParams): Promise<PaginatedResponse<Prescription>> =>
    api.get(`/prescriptions/patient/${id}`, { params }).then((r) => r.data),

  findById: (id: string): Promise<Prescription> =>
    api.get(`/prescriptions/${id}`).then((r) => r.data),

  create: (dto: CreatePrescriptionDto): Promise<Prescription> =>
    api.post('/prescriptions', dto).then((r) => r.data),

  update: (id: string, dto: UpdatePrescriptionDto): Promise<ApiResponse<Prescription>> =>
    api.patch(`/prescriptions/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/prescriptions/${id}`).then((r) => r.data),
};
