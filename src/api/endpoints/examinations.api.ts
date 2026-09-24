// src/api/endpoints/examinations.api.ts
import { api } from '@/api/axios';
import {
  Examination,
  CreateExaminationDto,
  UpdateExaminationDto,
  ExaminationQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const examinationsApi = {
  findAll: (params?: ExaminationQueryParams): Promise<PaginatedResponse<Examination>> =>
    api.get('/examinations', { params }).then((r) => r.data),

  findById: (id: string): Promise<ApiResponse<Examination>> =>
    api.get(`/examinations/${id}`).then((r) => r.data),

  create: (dto: CreateExaminationDto): Promise<ApiResponse<Examination>> =>
    api.post('/examinations', dto).then((r) => r.data),

  update: (id: string, dto: UpdateExaminationDto): Promise<ApiResponse<Examination>> =>
    api.patch(`/examinations/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/examinations/${id}`).then((r) => r.data),
};
