// src/api/endpoints/specialties.api.ts
import { api } from '@/api/axios';
import {
  Specialty,
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const specialtiesApi = {
  findAll: (params?: SpecialtyQueryParams): Promise<PaginatedResponse<Specialty>> =>
    api.get('/specialties', { params }).then((r) => r.data),

  getAllDropdown: (): Promise<Specialty[]> =>
    api.get('/specialties/all').then((r) => {
      // Handles both { data: [...] } and direct array [...]
      const res = r.data;
      return Array.isArray(res) ? res : res?.data || [];
    }),

  findById: (id: number): Promise<ApiResponse<Specialty>> =>
    api.get(`/specialties/${id}`).then((r) => r.data),

  create: (dto: CreateSpecialtyDto): Promise<Specialty> =>
    api.post('/specialties', dto).then((r) => r.data),

  update: (id: number, dto: UpdateSpecialtyDto): Promise<Specialty> =>
    api.put(`/specialties/${id}`, dto).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/specialties/${id}`).then((r) => r.data),
};
